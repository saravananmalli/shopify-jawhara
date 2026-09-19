import { CART_FRAGMENT, PRODUCT_DETAIL_FRAGMENT, PRODUCT_FRAGMENT } from "@/graphql/fragments";

export const PRODUCTS_QUERY = /* GraphQL */ `
  query Products($first: Int!, $sortKey: ProductSortKeys!) {
    products(first: $first, sortKey: $sortKey) {
      edges {
        node {
          ...ProductFields
        }
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const SEARCH_PRODUCTS_QUERY = /* GraphQL */ `
  query SearchProducts($query: String!, $first: Int!) {
    products(first: $first, query: $query) {
      edges {
        node {
          ...ProductFields
        }
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  query Product($handle: String!) {
    product(handle: $handle) {
      ...ProductDetailFields
    }
  }
  ${PRODUCT_DETAIL_FRAGMENT}
`;

export const CART_QUERY = /* GraphQL */ `
  query Cart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFields
    }
  }
  ${CART_FRAGMENT}
`;

export const BRAND_QUERY = /* GraphQL */ `
  query Brand {
    shop {
      name
      brand {
        logo {
          image {
            url
            altText
          }
        }
        slogan
        shortDescription
      }
    }
  }
`;

/**
 * 5 levels deep — top nav item, mega-menu column, column link, nested
 * flyout column, flyout link — so a Department sidebar item (e.g.
 * "Diamonds & Solitaire") can itself open a secondary panel with its own
 * sections. GraphQL can't select recursively, so each level is hand-nested
 * here; going deeper needs another manually-nested \`items\` block.
 */
const MENU_ITEM_FIELDS = /* GraphQL */ `
  title
  url
  items {
    title
    url
    items {
      title
      url
      items {
        title
        url
        items {
          title
          url
        }
      }
    }
  }
`;

export const MENU_QUERY = /* GraphQL */ `
  query Menu($handle: String!) {
    menu(handle: $handle) {
      items {
        ${MENU_ITEM_FIELDS}
      }
    }
  }
`;

export const COLLECTION_BY_HANDLE_QUERY = /* GraphQL */ `
  query CollectionByHandle($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      image {
        ...ImageFields
      }
      products(first: $first) {
        edges {
          node {
            ...ProductFields
          }
        }
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const COLLECTIONS_QUERY = /* GraphQL */ `
  query Collections($first: Int!) {
    collections(first: $first, sortKey: TITLE) {
      edges {
        node {
          id
          title
          handle
          image {
            url
            altText
          }
        }
      }
    }
  }
`;

export const HERO_BANNERS_QUERY = /* GraphQL */ `
  query HeroBanners($first: Int!) {
    metaobjects(type: "hero_banner", first: $first) {
      edges {
        node {
          id
          eyebrow: field(key: "eyebrow") {
            value
          }
          englishLine: field(key: "english_line") {
            value
          }
          arabicLine: field(key: "arabic_line") {
            value
          }
          badgeLabel: field(key: "badge_label") {
            value
          }
          badgeValue: field(key: "badge_value") {
            value
          }
          href: field(key: "link") {
            value
          }
          hasBakedInText: field(key: "has_baked_in_text") {
            value
          }
          displayOrder: field(key: "display_order") {
            value
          }
          image: field(key: "image") {
            reference {
              ... on MediaImage {
                image {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const OCCASIONS_QUERY = /* GraphQL */ `
  query Occasions($first: Int!) {
    metaobjects(type: "occasion", first: $first) {
      edges {
        node {
          id
          title: field(key: "title") {
            value
          }
          tagline: field(key: "tagline") {
            value
          }
          description: field(key: "description") {
            value
          }
          badgeLabel: field(key: "badge_label") {
            value
          }
          badgeText: field(key: "badge_text") {
            value
          }
          ctaLabel: field(key: "cta_label") {
            value
          }
          ctaUrl: field(key: "cta_url") {
            value
          }
          displayOrder: field(key: "display_order") {
            value
          }
          active: field(key: "active") {
            value
          }
          image: field(key: "image") {
            reference {
              ... on MediaImage {
                image {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const TESTIMONIALS_QUERY = /* GraphQL */ `
  query Testimonials($first: Int!) {
    metaobjects(type: "testimonial", first: $first) {
      edges {
        node {
          id
          quote: field(key: "quote") {
            value
          }
          customerName: field(key: "customer_name") {
            value
          }
          detail: field(key: "detail") {
            value
          }
          rating: field(key: "rating") {
            value
          }
          displayOrder: field(key: "display_order") {
            value
          }
          active: field(key: "active") {
            value
          }
        }
      }
    }
  }
`;

/** Handles only — the sitemap doesn't need images, prices or variants. */
export const SITEMAP_QUERY = /* GraphQL */ `
  query Sitemap($first: Int!) {
    products(first: $first) {
      edges {
        node {
          handle
          updatedAt
        }
      }
    }
    collections(first: $first) {
      edges {
        node {
          handle
          updatedAt
        }
      }
    }
  }
`;
