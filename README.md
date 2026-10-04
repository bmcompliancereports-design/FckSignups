# NoSignups
## (formerly FckSignups)

[![Discord](https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/c3zwcFgrK6)
[![Reddit](https://img.shields.io/badge/Reddit-FF4500?style=for-the-badge&logo=reddit&logoColor=white)](https://www.reddit.com/r/fucksignups/)

> **Open Source Tools. Zero Bullsh*t.**
A curated collection of open-source tools you can use instantly in your browser. no accounts, no emails, no tracking. Just tools that work.

---

## Brochure Visual Auditor

A preservation-first visual QA tool specification for auditing institutional brochures without redesigning them.

### Audits
- facial distortion and visual identity-risk artifacts
- AI/generative image artifacts
- color palette consistency
- typography consistency and hierarchy
- layout density, spacing, alignment, and clutter
- readability and communication hierarchy

### Preservation rules
The existing artwork is authoritative.

The auditor must **never**:
- redesign the composition
- rewrite copy
- replace people or photographs
- regenerate faces
- alter identity, pose, or clothing
- move major structural elements
- replace logos
- introduce a different visual concept

It may only recommend or perform explicitly authorized restoration/refinement operations such as restrained color correction, artifact cleanup, typography normalization, and spacing cleanup.

### Output
Every issue contains:
`ID | Category | Severity | Region | Confidence | Evidence | Impact | Minimal Correction | Preservation Risk`

Global scores:
- Visual Quality
- Communication
- Artifact Risk
- Typography Consistency
- Color Consistency
- Preservation Compliance

See:
- `docs/brochure-audit-spec.md`
- `config/brochure_rules.yaml`

---

## Tool schema

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | URL-friendly unique identifier |
| `name` | Yes | Display name |
| `description` | Yes | One-sentence summary |
| `url` | Yes | Direct link to the tool |
| `category` | Yes | Must match a category `id` |
| `tags` | No | Array of searchable keywords |
| `github` | No | Link to source repository |
| `license` | No | SPDX license identifier |
| `stars` | No | GitHub star count (for display) |
| `featured` | No | Boolean; pins to top |
| `notRecommendedReason` | No | Reason why the entry isn't recommended |

---

## Categories

| ID | Name | Icon |
|----|------|------|
| `all` | All | ◈ |
| `productivity` | Productivity | ⚡ |
| `design` | Design & Graphics | 🎨 |
| `development` | Development | 💻 |
| `writing` | Writing & Docs | ✍️ |
| `privacy` | Privacy | 🔒 |
| `utilities` | Utilities | 🛠️ |
| `data` | Data & Analytics | 📊 |
| `media` | Media | 🎬 |
| `education` | Education | 🎓 |

---

## Contributing

### Contribution guidelines
- The tool must work **without creating an account**
- Keep descriptions under 140 characters
- Use 3-5 relevant tags per tool
- Use the following link to add a tool you [found/made](https://github.com/BraveOPotato/FckSignups/issues/new?template=request-to-add-a-tool.md) or simply use the "SUBMIT A TOOL" button on the website.

---

## Discussions

If you'd like to voice your opinion, we have a community on reddit [r/fucksignups](https://www.reddit.com/r/fucksignups/).

---

## License

The NoSignups directory code is released under the **GPL-3.0 License**.

Individual tools listed in the directory retain their own licenses. We do not claim ownership of any third-party projects.

---

## Credits

Curated with spite by people who are tired of typing their email into everything.

---

*No cookies. No analytics. No bullsh*t.*
