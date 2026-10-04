import { Footer } from "./components/Home/Footer/Footer";
import { Header } from "./components/Home/Header/Header";
import { ReportFloatingWidget } from "./components/Home/ReportFloatingWidget/ReportFloatingWidget";
import { ToolFilters } from "./components/Home/ToolFilters/ToolFilters";
import { Tools } from "./components/Home/Tools/Tools";
import { ScrollToTopButton } from "./components/Shared/Buttons/ScrollToTopButton/ScrollToTopButton";
import SkipContentLink from "./components/Shared/Links/SkipContentLink/SkipContentLink";
import { MODAL_CONFIGS } from "./constants/ModalConfigs";
import { ModalProvider } from "./hooks/useModal";
import { ReportProvider } from "./hooks/useReport";
import { useTools } from "./hooks/useTools";
import type { SortOption } from "./types";

export default function App() {
  const {
    tools,
    filteredTools,
    sections,
    searchKeywords,
    isSearching,
    categories,
    loadStatus,
    errorMessage,
    query,
    activeCategory,
    sortBy,
    onCategoryChange,
    onSearchChange,
    onSortChange,
  } = useTools();

  const activeCat = categories.find((c) => c.id === activeCategory);

  return (
    <div className="container">
      <ModalProvider modalConfigs={MODAL_CONFIGS}>
        <SkipContentLink />
        <Header
          toolCount={tools.length}
          categoryCount={Math.max(0, categories.length - 1)}
        />

        <ToolFilters
          categories={categories}
          activeCategory={activeCategory}
          searchQuery={query}
          allTools={tools}
          filteredCount={filteredTools.length}
          sortBy={sortBy as SortOption}
          onCategoryChange={onCategoryChange}
          onSearchChange={onSearchChange}
          onSortChange={onSortChange}
        />
        {activeCat && activeCat.id !== "all" && (
          <div className="section-divider">
            {`${activeCat.icon} ${activeCat.name}`}
          </div>
        )}

        <ReportProvider>
          <Tools
            sections={sections}
            searchKeywords={searchKeywords}
            isSearching={isSearching}
            categories={categories}
            loadStatus={loadStatus}
            errorMessage={errorMessage}
            searchQuery={query}
            activeCategory={activeCategory}
            sortBy={sortBy as SortOption}
            onSearchChange={onSearchChange}
          />

          <ReportFloatingWidget />
        </ReportProvider>
        <ScrollToTopButton />
        <Footer />
      </ModalProvider>
    </div>
  );
}
