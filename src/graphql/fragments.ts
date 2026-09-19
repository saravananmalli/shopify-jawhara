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
    brand: metafield(namespace: "custom", key: "brand") {
      value
    }
    metalType: metafield(namespace: "custom", key: "metal_type") {
      value
    }
    diamondClarity: metafield(namespace: "custom", key: "diamond_clarity") {
      value
    }
    diamondColor: metafield(namespace: "custom", key: "diamond_color") {
      value
    }
    diamondCt: metafield(namespace: "custom", key: "diamond_ct") {
      value
    }
    grossWeight: metafield(namespace: "custom", key: "gross_weight") {
      value
    }
    color: metafield(namespace: "custom", key: "color") {
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
