/**
 * Customer-service contact channels, copied from jawharajewellery.com/pages/contact
 * (corporate address from the footer). Static for now; these belong in Shopify
 * (shop contact / a metaobject) once the merchant wants to edit them without a deploy.
 */
export const contact = {
  phone: { display: "(+971) 4 506 2000", href: "tel:+97145062000" },
  whatsapp: { display: "(+971) 50 752 8012", href: "https://wa.me/971507528012" },
  serviceEmail: "Customerservice@jawharajewellery.ae",
  corporateEmail: "b2b@jawharajewellery.ae",
  headOffice: {
    en: "Al Dhagaya, Old Gold Souk, Deira, Jawhara Jewellery Building, Dubai",
    ar: "الضغاية، سوق الذهب القديم، ديرة، مبنى مجوهرات جواهرة، دبي",
  },
} as const;
