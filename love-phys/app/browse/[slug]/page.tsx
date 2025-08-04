import { Metadata } from "next";
import { notFound } from "next/navigation";
import { BrowseDetailClient } from "./browse-detail-client";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

interface BrowseDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Server-side slug validation
function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug) && slug.length > 0 && slug.length <= 60;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: BrowseDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;

  if (!isValidSlug(resolvedParams.slug)) {
    return {
      title: "Page Not Found",
    };
  }

  try {
    const explanation = await fetchQuery(
      api.queries.getPublicExplanationBySlug,
      {
        slug: resolvedParams.slug,
      }
    );

    if (!explanation) {
      return {
        title: "Explanation Not Found",
      };
    }

    const title = `${explanation.question}`;
    const description = explanation.explanation
      ? explanation.explanation.substring(0, 160) + "..."
      : `Learn about ${explanation.question} with our AI-generated explanation.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        url: `/browse/${resolvedParams.slug}`,
        siteName: "Love Physics",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
      robots: {
        index: true,
        follow: true,
      },
      alternates: {
        canonical: `/browse/${resolvedParams.slug}`,
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return {
      title: "Error Loading Explanation",
    };
  }
}

export default async function BrowseDetailPage({
  params,
}: BrowseDetailPageProps) {
  const resolvedParams = await params;

  // Server-side validation
  if (!isValidSlug(resolvedParams.slug)) {
    notFound();
  }

  let explanation;
  try {
    explanation = await fetchQuery(api.queries.getPublicExplanationBySlug, {
      slug: resolvedParams.slug,
    });
  } catch (error) {
    console.error("Error fetching explanation:", error);
    notFound();
  }

  if (!explanation) {
    notFound();
  }

  // Generate structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: explanation.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: explanation.explanation || explanation.question,
        dateCreated: new Date(explanation.createdAt).toISOString(),
      },
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Browse",
          item: "/browse",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: explanation.question,
          item: `/browse/${resolvedParams.slug}`,
        },
      ],
    },
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Server-rendered content with proper heading structure */}
          <main>
            <h1 className="sr-only">{explanation.question}</h1>

            {/* Pass data to client component */}
            <BrowseDetailClient
              explanation={explanation}
              slug={resolvedParams.slug}
            />
          </main>
        </div>
      </div>
    </>
  );
}
