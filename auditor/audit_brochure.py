from __future__ import annotations
from pathlib import Path
import argparse, json
from PIL import Image, ImageDraw, ImageFont, ImageStat, ImageFilter

def dominant_palette(img, n=12):
    s=img.resize((160,160))
    colors=sorted(s.getcolors(160*160) or [], reverse=True)[:n]
    total=sum(c for c,_ in colors) or 1
    return [{"hex":f"#{r:02X}{g:02X}{b:02X}","share":round(c/total,4)}
            for c,(r,g,b) in colors]

def analyze(img):
    stat=ImageStat.Stat(img)
    edge=ImageStat.Stat(img.convert("L").filter(ImageFilter.FIND_EDGES)).mean[0]/80
    contrast=sum(stat.stddev)/3/255
    mean=sum(stat.mean)/3/255
    issues=[]
    if contrast < .18:
        issues.append({
            "id":"COL-001","category":"Color","severity":"MODERATE","confidence":0.72,
            "region":[0,0,img.width,img.height],
            "evidence":"Low global pixel variance is a review flag for possible flat or washed treatment.",
            "impact":"May weaken separation between hierarchy levels.",
            "minimal_correction":"Use restrained local contrast only where justified; preserve existing colors.",
            "preservation_risk":"LOW"
        })
    if edge > .62:
        issues.append({
            "id":"LAY-001","category":"Layout","severity":"MODERATE","confidence":0.61,
            "region":[0,0,img.width,img.height],
            "evidence":"High edge density is a visual-busyness review flag, not proof of clutter.",
            "impact":"May increase scanning difficulty.",
            "minimal_correction":"Review competing visual edges; do not delete or move elements automatically.",
            "preservation_risk":"LOW"
        })
    return {
        "dimensions":{"width":img.width,"height":img.height},
        "metrics":{
            "mean_luminance_proxy":round(mean,4),
            "contrast_proxy":round(contrast,4),
            "edge_density_proxy":round(edge,4)
        },
        "dominant_palette":dominant_palette(img),
        "scores":{
            "visual_quality":None,
            "communication":None,
            "artifact_risk":None,
            "typography_consistency":None,
            "color_consistency":None,
            "preservation_compliance":100
        },
        "issues":issues,
        "limitations":[
            "Advanced face/anatomy, OCR/typography and generative-artifact detection are intentionally model-backed extensions.",
            "This baseline does not invent findings from unsupported signals.",
            "Audit mode never modifies source pixels."
        ]
    }

def annotate(img, report, out):
    canvas=img.copy()
    d=ImageDraw.Draw(canvas)
    font=ImageFont.load_default()
    for it in report["issues"]:
        x,y,w,h=it["region"]
        d.rectangle((x,y,x+w,y+h), outline=(220,40,40), width=max(2,img.width//500))
        d.text((x+5,max(0,y-14)),f'{it["id"]} {it["category"]}',fill=(220,40,40),font=font)
    canvas.save(out,quality=95)

def main():
    ap=argparse.ArgumentParser(description="Preservation-first brochure visual QA")
    ap.add_argument("image")
    ap.add_argument("--out",default="brochure_audit_output")
    a=ap.parse_args()
    out=Path(a.out); out.mkdir(parents=True,exist_ok=True)
    img=Image.open(a.image).convert("RGB")
    report=analyze(img)
    report["file"]=a.image
    (out/"audit.json").write_text(json.dumps(report,indent=2),encoding="utf-8")
    annotate(img,report,out/"annotated.jpg")

if __name__=="__main__":
    main()
