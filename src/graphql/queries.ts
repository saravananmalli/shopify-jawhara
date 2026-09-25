import {
  CART_FRAGMENT,
  PRODUCT_DETAIL_FRAGMENT,
  PRODUCT_FILTER_FRAGMENT,
  PRODUCT_CARD_FRAGMENT,
} from "@/graphql/fragments";

export const PRODUCTS_QUERY = /* GraphQL */ `
  query Products($first: Int!, $sortKey: ProductSortKeys!, $reverse: Boolean = false) {
    products(first: $first, sortKey: $sortKey, reverse: $reverse) {
      edges {
        node {
          ...ProductCardFields
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

/** Default `products` order is COLLECTION_DEFAULT — the manual order set in Shopify Admin. */
export const COLLECTION_PRODUCTS_QUERY = /* GraphQL */ `
  query CollectionProducts($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      products(first: $first) {
        edges {
          node {
            ...ProductCardFields
          }
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

export const SEARCH_PRODUCTS_QUERY = /* GraphQL */ `
  query SearchProducts($query: String!, $first: Int!) {
    products(first: $first, query: $query) {
      edges {
        node {
          ...ProductCardFields
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
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

/**
 * Collection headers (title, description, image) for several handles in one
 * round trip. Deliberately no products: nav tiles, category strips and the
 * metadata head only need the image and title, and a collection's products
 * were the bulk of the payload.
 */
export function buildCollectionsByHandlesQuery(count: number) {
  const variables = Array.from({ length: count }, (_, i) => `$h${i}: String!`);
  const fields = Array.from(
    { length: count },
    (_, i) => `c${i}: collection(handle: $h${i}) { ...CollectionHeader }`,
  );
  return /* GraphQL */ `
    query CollectionsByHandles(${variables.join(", ")}) {
      ${fields.join("\n      ")}
    }
    fragment CollectionHeader on Collection {
      id
      title
      handle
      description
      image {
        url
        altText
      }
    }
  `;
}

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

export const STORE_LOCATIONS_QUERY = /* GraphQL */ `
  query StoreLocations($first: Int!) {
    metaobjects(type: "store_location", first: $first) {
      edges {
        node {
          id
          name: field(key: "name") {
            value
          }
          address: field(key: "address") {
            value
          }
          country: field(key: "country") {
            value
          }
          region: field(key: "region") {
            value
          }
          phone: field(key: "phone") {
            value
          }
          hours: field(key: "hours") {
            value
          }
          mapLink: field(key: "map_link") {
            value
          }
          latitude: field(key: "latitude") {
            value
          }
          longitude: field(key: "longitude") {
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

export const PRODUCT_RECOMMENDATIONS_QUERY = /* GraphQL */ `
  query ProductRecommendations($productId: ID!) {
    productRecommendations(productId: $productId, intent: RELATED) {
      ...ProductCardFields
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

export const PRODUCTS_BY_IDS_QUERY = /* GraphQL */ `
  query ProductsByIds($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        ...ProductCardFields
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

/**
 * `$withFilters` lets "load more" skip the (potentially large) facet list —
 * only the first page of a given filter state needs it.
 */
export const CATALOG_COLLECTION_QUERY = /* GraphQL */ `
  query CatalogCollection(
    $handle: String!
    $first: Int!
    $after: String
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys!
    $reverse: Boolean!
    $withFilters: Boolean!
  ) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      products(
        first: $first
        after: $after
        filters: $filters
        sortKey: $sortKey
        reverse: $reverse
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        filters @include(if: $withFilters) {
          ...ProductFilterFields
        }
        edges {
          node {
            ...ProductCardFields
          }
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
  ${PRODUCT_FILTER_FRAGMENT}
`;

/** Backs the "all products" page — Shopify has no `all` collection in the Storefront API. */
export const CATALOG_SEARCH_QUERY = /* GraphQL */ `
  query CatalogSearch(
    $first: Int!
    $after: String
    $filters: [ProductFilter!]
    $sortKey: SearchSortKeys!
    $reverse: Boolean!
    $withFilters: Boolean!
  ) {
    search(
      query: ""
      types: PRODUCT
      first: $first
      after: $after
      productFilters: $filters
      sortKey: $sortKey
      reverse: $reverse
    ) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      productFilters @include(if: $withFilters) {
        ...ProductFilterFields
      }
      edges {
        node {
          ... on Product {
            ...ProductCardFields
          }
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
  ${PRODUCT_FILTER_FRAGMENT}
`;

/** Only collection-linked items carry an image; everything else resolves to null. */
export const CATEGORY_MENU_QUERY = /* GraphQL */ `
  query CategoryMenu($handle: String!) {
    menu(handle: $handle) {
      items {
        title
        resource {
          ... on Collection {
            id
            handle
            image {
              url
              altText
            }
          }
        }
      }
    }
  }
`;

/**
 * Shopify ignores `tag` in the `filters` argument (only price, availability
 * and Search & Discovery facets are honoured), and has no multi-range price
 * or on-sale filter. Those are resolved by scanning a light per-product
 * payload (id, tags, prices) and fetching the matching page afterwards.
 */
export const CATALOG_TAG_SCAN_COLLECTION_QUERY = /* GraphQL */ `
  query CatalogTagScanCollection(
    $handle: String!
    $first: Int!
    $after: String
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys!
    $reverse: Boolean!
    $withFilters: Boolean!
  ) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      products(
        first: $first
        after: $after
        filters: $filters
        sortKey: $sortKey
        reverse: $reverse
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        filters @include(if: $withFilters) {
          ...ProductFilterFields
        }
        nodes {
          id
          tags
          collections(first: 20) {
            nodes {
              handle
            }
          }
          priceRange {
            minVariantPrice {
              amount
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
            }
          }
        }
      }
    }
  }
  ${PRODUCT_FILTER_FRAGMENT}
`;

export const CATALOG_TAG_SCAN_SEARCH_QUERY = /* GraphQL */ `
  query CatalogTagScanSearch(
    $first: Int!
    $after: String
    $filters: [ProductFilter!]
    $sortKey: SearchSortKeys!
    $reverse: Boolean!
    $withFilters: Boolean!
  ) {
    search(
      query: ""
      types: PRODUCT
      first: $first
      after: $after
      productFilters: $filters
      sortKey: $sortKey
      reverse: $reverse
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      productFilters @include(if: $withFilters) {
        ...ProductFilterFields
      }
      nodes {
        ... on Product {
          id
          tags
          collections(first: 20) {
            nodes {
              handle
            }
          }
          priceRange {
            minVariantPrice {
              amount
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
            }
          }
        }
      }
    }
  }
  ${PRODUCT_FILTER_FRAGMENT}
`;

/**
 * Top item → mega-menu column → link, or top item → link for a flat menu
 * (e.g. "Our Collections"); each link's collection carries the tile image.
 */
export const MAIN_MENU_COLLECTIONS_QUERY = /* GraphQL */ `
  query MainMenuCollections($handle: String!) {
    menu(handle: $handle) {
      items {
        title
        items {
          title
          resource {
            ... on Collection {
              id
              handle
              image {
                url
                altText
              }
            }
          }
          items {
            title
            resource {
              ... on Collection {
                id
                handle
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

export const REVIEW_PRODUCTS_QUERY = /* GraphQL */ `
  query ReviewProducts($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        id
        handle
        title
        featuredImage {
          url
          altText
        }
      }
    }
  }
`;

/** Online Store page by handle (Admin → Online Store → Pages). `body` is HTML. */
export const PAGE_QUERY = /* GraphQL */ `
  query Page($handle: String!) {
    page(handle: $handle) {
      handle
      title
      body
      seo {
        title
        description
      }
    }
  }
`;

/** Shop policies (Admin → Settings → Policies). Any of them may be null. */
export const SHOP_POLICIES_QUERY = /* GraphQL */ `
  query ShopPolicies {
    shop {
      privacyPolicy {
        handle
        title
        body
      }
      refundPolicy {
        handle
        title
        body
      }
      shippingPolicy {
        handle
        title
        body
      }
      termsOfService {
        handle
        title
        body
      }
    }
  }
`;
