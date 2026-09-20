import { PRODUCT_SPEC_FIELDS, PRODUCT_SPEC_NAMESPACE } from "@/config/product-specs";
export const IMAGE_FRAGMENT = /* GraphQL */ `
  fragment ImageFields on Image {
    url
    altText
    width
    height
  }
`;

export const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    availableForSale
    tags
    rating: metafield(namespace: "reviews", key: "rating") {
      value
    }
    ratingCount: metafield(namespace: "reviews", key: "rating_count") {
      value
    }
    featuredImage {
      ...ImageFields
    }
    images(first: 8) {
      edges {
        node {
          ...ImageFields
        }
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 25) {
      edges {
        node {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
        }
      }
    }
  }
  ${IMAGE_FRAGMENT}
`;

/**
 * List views (homepage shelves, search, collection grids, carousels). A card
 * only shows the featured photo, a hover photo, price, first-variant quick-add
 * and rating, so this stays far smaller than ProductFields (8 images, 25
 * variants, description) — the difference is large across a 24-card page.
 */
export const PRODUCT_CARD_FRAGMENT = /* GraphQL */ `
  fragment ProductCardFields on Product {
    id
    handle
    title
    availableForSale
    tags
    rating: metafield(namespace: "reviews", key: "rating") {
      value
    }
    ratingCount: metafield(namespace: "reviews", key: "rating_count") {
      value
    }
    featuredImage {
      ...ImageFields
    }
    images(first: 2) {
      edges {
        node {
          ...ImageFields
        }
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 1) {
      edges {
        node {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
        }
      }
    }
  }
  ${IMAGE_FRAGMENT}
`;

export const PRODUCT_FILTER_FRAGMENT = /* GraphQL */ `
  fragment ProductFilterFields on Filter {
    id
    label
    type
    values {
      id
      label
      count
      input
    }
  }
`;

const SPEC_IDENTIFIERS = PRODUCT_SPEC_FIELDS.map(
  (field) => `{namespace: "${PRODUCT_SPEC_NAMESPACE}", key: "${field.key}"}`
).join(", ");

/**
 * Product detail page only — everything ProductFields has, plus the
 * metafields/collections/variant SKU that page needs and nothing else
 * (list views — homepage, search, collections — stay on the lighter
 * ProductFields so they don't over-fetch per rule #21).
 */
export const PRODUCT_DETAIL_FRAGMENT = /* GraphQL */ `
  fragment ProductDetailFields on Product {
    ...ProductFields
    designCode: metafield(namespace: "custom", key: "design_code") {
      value
    }
    specs: metafields(identifiers: [${SPEC_IDENTIFIERS}]) {
      key
      type
      value
    }
    collections(first: 2) {
      edges {
        node {
          title
          handle
        }
      }
    }
    variants(first: 25) {
      edges {
        node {
          sku
        }
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              price {
                amount
                currencyCode
              }
              product {
                title
                handle
                featuredImage {
                  ...ImageFields
                }
              }
            }
          }
        }
      }
    }
  }
  ${IMAGE_FRAGMENT}
`;
