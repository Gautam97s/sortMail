export interface HelpArticle {
    slug: string;
    title: string;
    categoryTitle: string;
    readTime: string;
    lastUpdated: string;
    content: string;
    relatedArticles?: string[]; // array of slugs
}

export interface HelpCategory {
    title: string;
    description: string;
    iconName: string; // lucide icon name
    articles: { title: string; slug: string }[];
}
