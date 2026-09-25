import type { ContentPage } from "@/types/content";

/**
 * Text of the customer-service pages, copied from jawharajewellery.com.
 * Only used when the Shopify store has no page/policy with that handle — a
 * page created in Shopify Admin always wins, so this can be deleted entry by
 * entry as the merchant moves each page into Admin. English only: the source
 * text has no Arabic version, so /ar shows the English text until Shopify
 * translations exist.
 */

export type FaqItem = { q: string; a: string[] };
export type FaqGroup = { heading: string; items: FaqItem[] };

export type StaticFaqPage = { title: string; description: string; groups: FaqGroup[] };

const SERVICE_EMAIL = "customerservice@jawharajewellery.ae";

/** Pages that live on another route on this site instead of getting a copy. */
export const STATIC_REDIRECTS: Record<string, string> = {
  about: "/pages/heritage-since-1907",
  contact: "/customer-service",
};

const FAQ_SOURCE: StaticFaqPage = {
  title: "Frequently Asked Questions",
  description:
    "Answers about shipping, payments, exchanges, gold and diamond quality, warranty and care at Jawhara Jewellery.",
  groups: [
    {
      heading: "Shipping, Payments & Exchange",
      items: [
        {
          q: "What are the Shipping Charges and Delivery Times?",
          a: [
            "Domestic Delivery: Jawhara Jewellery offers free delivery within the UAE through DHL, typically within 3-4 working days. International Shipping: Charges vary by country and delivery time. Customized jewellery delivery is scheduled after complete evaluation.",
          ],
        },
        {
          q: "What forms of Payment are accepted by Jawhara Jewellery?",
          a: ["Online shopping accepts debit and credit cards. In-store shopping accepts debit and credit cards, and cash. Cash on delivery is not available."],
        },
        {
          q: "Can I send a Gift from Jawhara Jewellery or ship it to a different address?",
          a: ["Yes, enter the delivery address and include the recipient's full name and phone number during checkout. Items are delivered with relevant certificates."],
        },
        {
          q: "Do I need to be present to sign for the delivery?",
          a: ["Yes, DHL couriers verify recipient identity and record identity proof details for security and accuracy."],
        },
        {
          q: "How do I change my delivery address or scheduled delivery date?",
          a: ["Contact Jawhara Jewellery Customer Service at +971 50 687 5051 as soon as possible."],
        },
        { q: "Can I place an order via Telephone?", a: ["Yes, call +971 50 687 5051 to order by phone."] },
        {
          q: "Will my online purchase arrive Gift-Wrapped?",
          a: ["All purchases arrive in Jawhara's signature box with refined ribbon wrapping. At checkout, add personalized gift messages in stylish envelopes, or receive blank cards for personal messages."],
        },
        {
          q: "Do you offer International Shipping?",
          a: ["Yes, international shipping is available. Jawhara has stores in 11 countries worldwide. Check the Stores section for locations."],
        },
      ],
    },
    {
      heading: "Jewellery Collections & Customization",
      items: [
        {
          q: "Are all Jewellery Collections available on the website?",
          a: ["Only a selection is available online. Visit Collections section or a Jawhara store for the full range."],
        },
        {
          q: "How can I customise a piece of jewellery at Jawhara Jewellery?",
          a: ["Jawhara offers customization services. Visit a store, check the customization section online, or contact +971 50 752 8012 for details."],
        },
      ],
    },
    {
      heading: "Exchange & Returns",
      items: [
        {
          q: "How can I exchange Jewellery at Jawhara Jewellery?",
          a: ["Bring the jewellery, original receipt, and diamond certification (for diamond pieces) to any Jawhara store in your purchase country. Refer to the Jawhara Promise for exchange terms and conditions."],
        },
        {
          q: "Can I return the Jewellery for a refund?",
          a: ["Jawhara does not provide refunds. Instead, they offer a flexible exchange policy allowing exchanges for other items or upgrades to higher-value products. Visit Terms & Conditions and Exchange Policy pages for details."],
        },
      ],
    },
    {
      heading: "Gold Quality",
      items: [
        {
          q: "What is the quality of the Gold used by Jawhara Jewellery?",
          a: ["Pieces are crafted from: 18k gold (750 millesimal fineness), 21k gold (875 millesimal fineness), and 22k gold (916 millesimal fineness)."],
        },
      ],
    },
    {
      heading: "Diamonds & Certification",
      items: [
        {
          q: "What is the quality of the Diamonds used by Jawhara Jewellery?",
          a: ["All diamonds are natural and certified by the International Diamond Laboratories (NDC), adhering to rigorous standards of excellence."],
        },
        {
          q: "What are the quality criteria for Jawhara Jewellery Diamonds (4Cs)?",
          a: [
            "**Clarity:** Measures inclusions visible under 10x magnification. Jawhara diamonds range from Flawless (FL) to Very Slightly Included (VS-SI).",
            "**Colour:** Ranges from D (totally colourless) to I. Colorless diamonds are rarer and more precious.",
            "**Cut:** Affects brilliance, fire, and scintillation. Excellent cuts have precise proportions and symmetrical facets. Available in nearly all shapes: Round Brilliant, Princess, Pear, Emerald, Heart, Oval, Marquise, Cushion, Baguette, and Asscher.",
            "**Carat:** Measures weight; one carat equals 0.20 grams. Jawhara offers diamonds ranging from 1 to 200 carats.",
          ],
        },
        {
          q: "Does Jawhara Jewellery provide Diamond Certification?",
          a: ["Yes, every natural diamond purchase includes a certificate from the International Diamond Laboratories."],
        },
        {
          q: "Where do Jawhara's Diamonds come from?",
          a: ["Jawhara partners with the Natural Diamond Council (NDC) and sources diamonds ethically and responsibly. Every diamond includes a certificate detailing attributes and source, ensuring sustainable practices and ethical mining standards."],
        },
      ],
    },
    {
      heading: "Warranty & Product Care",
      items: [
        {
          q: "Is there a warranty for Jawhara's Jewellery?",
          a: [
            "All products include a lifetime warranty and annual free polishing service covering manufacturing defects with valid proof of purchase.",
            "**Exclusions:** The warranty does not cover damage from normal wear and tear, misuse, loss, color changes from chemicals/perfumes/beauty products, or natural color/lustre changes in pearls or gemstones. Warranty voids if repaired by anyone other than Jawhara. Additional fees may apply for repairs outside warranty coverage. Third-party or international brands follow their own policies.",
          ],
        },
        {
          q: "Where can I have my Jawhara Jewellery serviced?",
          a: ["Bring jewellery to any Jawhara store. The company operates an international workshop network adhering to highest technical standards. Repairs outside Jawhara stores may risk severe damage."],
        },
        {
          q: "How can I get an item repaired?",
          a: ["Bring your piece to the nearest Jawhara store. Check repair status by contacting the store directly or customer service at 045062121."],
        },
      ],
    },
    {
      heading: "Contact & Information",
      items: [
        { q: "How can I contact Jawhara Jewellery?", a: ["Contact customer service or visit any Jawhara store for assistance."] },
        {
          q: "How can I learn about Jawhara's new collections and offers?",
          a: ["Subscribe to their YouTube channel and follow social media for exciting updates."],
        },
      ],
    },
  ],
};

/** The five tabs of the original page, each listing its questions in the original order. */
const FAQ_TABS: { heading: string; questions: string[] }[] = [
  {
    heading: "Shipping, Payments & Exchange",
    questions: [
      "What are the Shipping Charges and Delivery Times?",
      "How can I exchange Jewellery at Jawhara Jewellery?",
      "Can I return the Jewellery for a refund?",
      "Will my online purchase arrive Gift-Wrapped?",
      "Do you offer International Shipping?",
      "What forms of Payment are accepted by Jawhara Jewellery?",
      "Can I send a Gift from Jawhara Jewellery or ship it to a different address?",
      "Do I need to be present to sign for the delivery?",
      "How do I change my delivery address or scheduled delivery date?",
      "Can I place an order via Telephone?",
    ],
  },
  {
    heading: "Jewellery",
    questions: [
      "Are all Jewellery Collections available on the website?",
      "What is the quality of the Gold used by Jawhara Jewellery?",
      "How can I customise a piece of jewellery at Jawhara Jewellery?",
    ],
  },
  {
    heading: "Diamonds",
    questions: [
      "What is the quality of the Diamonds used by Jawhara Jewellery?",
      "What are the quality criteria for Jawhara Jewellery Diamonds (4Cs)?",
      "Does Jawhara Jewellery provide Diamond Certification?",
      "Where do Jawhara's Diamonds come from?",
    ],
  },
  {
    heading: "Contact & Visit Jawhara Jewellery",
    questions: [
      "How can I contact Jawhara Jewellery?",
      "How can I learn about Jawhara's new collections and offers?",
    ],
  },
  {
    heading: "Warranty & Product Care",
    questions: [
      "Is there a warranty for Jawhara's Jewellery?",
      "Where can I have my Jawhara Jewellery serviced?",
      "How can I get an item repaired?",
    ],
  },
];

const FAQ_BY_QUESTION = new Map(FAQ_SOURCE.groups.flatMap((g) => g.items).map((item) => [item.q, item]));

export const FAQ_PAGE: StaticFaqPage = {
  ...FAQ_SOURCE,
  groups: FAQ_TABS.map((tab) => ({
    heading: tab.heading,
    items: tab.questions.map((q) => {
      const item = FAQ_BY_QUESTION.get(q);
      if (!item) throw new Error(`FAQ question missing from source: ${q}`);
      return item;
    }),
  })),
};

type Article = Omit<ContentPage, "handle">;

const article = (title: string, description: string, bodyHtml: string): Article => ({
  title,
  seoTitle: null,
  seoDescription: description,
  bodyHtml,
});

const mail = (address: string) => `<a href="mailto:${address}">${address}</a>`;

/** Policies — `/policies/[handle]`. */
export const STATIC_POLICIES: Record<string, Article> = {
  "shipping-policy": article(
    "Shipping policy",
    "Delivery times, shipping charges, customs and import duties, and delivery rules for Jawhara Jewellery orders.",
    `<h2>Domestic Shipping</h2>
<p>Typically, it takes up to 3 to 4 working days.</p>
<p>You can monitor your shipment's status by visiting our logistics partner's website and using your tracking number, which is included in your shipment confirmation email or available on the Order Status page at <a href="https://jawharajewellery.com">jawharajewellery.com</a>.</p>
<h2>Shipping Charges</h2>
<p>We offer free shipping within the United Arab Emirates.</p>
<h2>International Shipping &amp; Customs Policy</h2>
<p>For all international orders, the customer is responsible for all applicable shipping fees, customs duties, taxes, and clearance charges. Jawhara shall not be held liable for any such charges incurred during international transit.</p>
<p>These costs are not included in the purchase price and must be paid by the customer upon delivery or as required by local authorities. The customer remains responsible for these charges until the shipment reaches their delivery address and is received.</p>
<h2>Order Tracking</h2>
<p>After your order has shipped, you'll receive an email from Jawhara with your tracking number and a link to our trusted courier partner.</p>
<p>The destination country determines shipping costs, which will be added to the billing and shipping information page during checkout.</p>
<h2>Import Taxes and Duties</h2>
<p>All shipments are dispatched from Dubai with completed export documentation. However, each shipment must clear customs in the destination country.</p>
<p>DHL will manage the customs clearance process, and any applicable import duties or taxes will be communicated to you before delivery. You will need to pay these charges before receiving your order.</p>
<p>We recommend checking your country's import regulations, duties, and taxes before placing your order.</p>
<h2>Delivery to Identified Person</h2>
<p>Please provide accurate consignee/recipient details, including name (as stated in their government-approved photo identification), complete address, nearby landmark, postal code, and contact number.</p>
<p>Upon delivery, the recipient must present government-approved identity proof or address proof.</p>
<p>To ensure secure delivery, the courier agent will verify the recipient's identity and record the details of the proof provided. The recipient is expected to cooperate by presenting original copies of their identity proof.</p>
<h2>Delivery Location</h2>
<p>We deliver to residential and commercial addresses only. We cannot deliver to public places such as malls, hotels, restaurants, hostels, or roadsides.</p>
<h2>Delivery Attempts and Returns</h2>
<p>We will make up to three delivery attempts if the recipient is unavailable. The package will be returned to our office if the recipient remains unreachable.</p>
<p>If the delivery is refused, return shipping charges and any import duties incurred in Dubai will be deducted from the refund amount.</p>
<p>Please make sure you're available to accept the delivery to avoid these charges.</p>
<h2>Need Assistance?</h2>
<p>For any questions or further assistance regarding your shipment, please contact us:</p>
<p><strong>Email:</strong> ${mail(SERVICE_EMAIL)}</p>`,
  ),

  "terms-of-service": article(
    "Terms of Service",
    "The terms that apply to using jawharajewellery.com and buying from Jawhara Jewellery, including the exchange and refund policy.",
    `<h2>1. Agreement</h2>
<p>Jawhara Jewellery LLC, established in Dubai, operates www.jawharajewellery.com. Accessing the Website means you accept these Terms and Conditions. The agreement is binding, and if you disagree, refrain from using the site.</p>
<p>Terms may be updated without notice, and continued use signifies acceptance. Jawhara reserves amendment rights. Additional terms apply to specific sections; consult the Privacy Policy for data usage information.</p>
<h2>2. Registration</h2>
<p>Provide accurate and complete information during registration and notify the company of any changes immediately. You bear responsibility for maintaining password confidentiality and account security.</p>
<h2>3. Eligibility to Purchase</h2>
<p>Only individuals legally capable of forming contracts under UAE law may purchase. Provide accurate billing and personal information, confirming you are the authorized cardholder.</p>
<h2>4. Orders</h2>
<p>Products are subject to availability. If unavailable, notification and refund within 30 days will follow. Stock issues prompt immediate notification.</p>
<h2>5. Pricing Policy</h2>
<p>All prices display in AED/USD and include applicable taxes. Jawhara may change prices at its discretion.</p>
<h2>6. Acceptance of Your Order</h2>
<p>Order confirmation email does not constitute acceptance. Acceptance occurs upon shipment confirmation. Jawhara reserves refusal or cancellation rights. Pricing errors may result in order cancellation and refund.</p>
<h2>7. Payment</h2>
<p>Accepted payment methods include Visa and MasterCard, plus other displayed options. Jawhara bears no responsibility for issuer-declined payments. SSL encryption and Mashreq Bank's secure payment gateway protect transactions. Third-party unauthorized access liability is excluded unless caused by negligence.</p>
<h2>8. Delivery and Insurance</h2>
<p>Free shipping applies within the UAE. Delivery takes 3–4 days domestically; international shipping depends on destination and DHL service. All deliveries require signature, with responsibility transferring upon delivery.</p>
<h2>9. International Shipping &amp; Customs Policy</h2>
<p>Customers assume responsibility for customs duties, taxes, and clearance charges imposed by destination country authorities.</p>
<h2>10. Returns and Exchanges</h2>
<p>Consult the Exchange and Refund Policy for complete details. UAE location exchanges require the original invoice.</p>
<h2>11. Use of Website Content</h2>
<p>Website content is reserved for personal, non-commercial use. Unauthorized reproduction, modification, or distribution is prohibited.</p>
<h2>12. Intellectual Property</h2>
<p>Jawhara owns or licenses all trademarks, logos, designs, and content. Unauthorized use is strictly prohibited.</p>
<h2>13. External Links and Promotions</h2>
<p>Jawhara disclaims responsibility for third-party external sites or promotional campaign terms.</p>
<h2>14. Indemnity</h2>
<p>You agree to indemnify Jawhara against claims arising from your Website misuse.</p>
<h2>15. Activity and Termination</h2>
<p>Jawhara reserves the right to suspend or terminate access without notice.</p>
<h2>16. Governing Law</h2>
<p>These Terms are governed by UAE law under Dubai Courts' exclusive jurisdiction.</p>
<h2>17. Promotional Terms</h2>
<h3>Promotional &amp; Discounted Items</h3>
<p>Available while supplies last. Jawhara may modify or cancel offers anytime.</p>
<h3>Promo Codes</h3>
<p>One-time use unless stated otherwise. Cannot combine with other offers unless specified. Fraudulent codes may be revoked.</p>
<h3>Gift with Purchase</h3>
<p>Available while supplies last. Applicable to selected items and dates only.</p>
<h2>Exchange and Refund Policy</h2>
<p><strong>Note:</strong> Customised jewellery is ineligible for return.</p>
<h3>Within 30 Days</h3>
<p><strong>Gold Jewellery:</strong> Exchangeable for gold, diamond jewellery, or gift voucher equaling invoice value. One exchange only.</p>
<p><strong>Diamond Jewellery:</strong> Exchangeable for diamond jewellery or gift voucher equaling invoice value. One exchange only.</p>
<p><strong>Pearl Jewellery:</strong> Exchange value determined by condition and Jawhara appraisal.</p>
<h3>After 30 Days – Within 1 Year</h3>
<p><strong>Gold Jewellery:</strong> Exchangeable based on current market gold price after deducting production, stones, and non-gold components.</p>
<p><strong>Diamond Jewellery:</strong> Exchangeable for diamond jewellery with up to 25% remodelling cost deduction. New item must exceed higher value.</p>
<h3>After 1 Year</h3>
<p><strong>Gold Jewellery:</strong> Exchange based on current market value minus production and non-gold components.</p>
<p><strong>Diamond Jewellery:</strong> Exchangeable based on material market valuation. New item must exceed exchanged value.</p>
<h3>Refund Policy</h3>
<p>No refunds are provided. Customers may exchange or upgrade products per the exchange policy.</p>`,
  ),

  "privacy-policy": article(
    "Privacy Policy",
    "What personal information Jawhara Jewellery collects, how it is used and protected, and how to contact us about your data.",
    `<h2>1. Information We Collect</h2>
<h3>Personal Information</h3>
<p>Jawhara gathers various personal details when customers register, update information, make purchases, participate in surveys, or communicate with the company. This includes:</p>
<ul><li>Name</li><li>Address</li><li>Phone number</li><li>Email address</li><li>Purchase history</li><li>Transaction details</li><li>Billing information</li><li>Interests</li></ul>
<h3>General Information</h3>
<p>The website collects general usage data such as:</p>
<ul><li>IP address</li><li>Date and time of access</li><li>Duration of visit</li><li>Browsing history</li><li>Referring website</li></ul>
<h2>2. How We Use Your Information</h2>
<h3>Personal Information</h3>
<p>The company uses collected personal data for:</p>
<ul><li>Managing customer accounts and platform access</li><li>Responding to inquiries and communications</li><li>Providing and enhancing products and services</li><li>Maintaining internal records</li><li>Sending order and purchase updates</li><li>Conducting analytics and service evaluation</li><li>Market research</li><li>Distributing promotional materials and offers</li><li>Customizing user experience</li><li>Fulfilling legal obligations</li></ul>
<h3>General Information</h3>
<p>General information helps the company to:</p>
<ul><li>Enhance website functionality and experience</li><li>Determine technical requirements</li><li>Monitor system performance</li><li>Analyze trends and generate usage reports</li></ul>
<h2>3. Non-Disclosure of Collected Information</h2>
<p>The company does not share, sell, or rent information except when you provide explicit consent, when law requires it, to protect rights or safety, or to fulfill requested services.</p>
<h2>4. Security</h2>
<p>Jawhara implements reasonable protective measures against unauthorized access, though no system guarantees complete security.</p>
<h2>5. Cookies</h2>
<p>The website uses cookies to enhance user experience, which visitors may disable through browser settings.</p>
<h2>6. Links to Third-Party Websites</h2>
<p>The company is not responsible for external sites' content or privacy practices.</p>
<h2>7. Applicable Law and Jurisdiction</h2>
<p>This policy follows United Arab Emirates law, with disputes handled by Dubai courts.</p>
<h2>8. Contact Us</h2>
<p>Customers may access, correct, update, delete, restrict, or object to their data processing. They may also opt out of marketing communications.</p>
<p><strong>Jawhara Jewellery LLC</strong><br>PO Box: 85583<br>Jawhara Building, Gold Souq<br>Deira, Dubai, UAE<br>Email: ${mail(SERVICE_EMAIL)}</p>`,
  ),
};

/** Pages — `/pages/[handle]`. */
export const STATIC_PAGES: Record<string, Article> = {
  "user-responsibilities": article(
    "User Responsibilities",
    "The rules for using the Jawhara Jewellery website: general conduct, account security and prohibited activities.",
    `<h2>General Conduct</h2>
<p>By accessing and using the Website, you agree to use the Website only for lawful purposes and in a manner consistent with these Terms and Conditions. You must not use the Website in any way that:</p>
<ul>
<li>Violates any applicable local, national, or international law or regulation;</li>
<li>Is fraudulent, or has any fraudulent purpose or effect;</li>
<li>Causes harm to any person or infringes upon the rights of others;</li>
<li>Transmits, or procures the sending of, any unsolicited or unauthorized advertising or promotional material or any other form of similar solicitation (spam);</li>
<li>Knowingly introduces or attempts to introduce any harmful material, such as viruses, Trojan horses, worms, logic bombs, or any other malicious software or technologically harmful data.</li>
</ul>
<h2>Accuracy of Information</h2>
<p>You agree to provide accurate, current, and complete information about yourself as prompted by the Website's registration or order forms. If any of your information changes, you agree to update it promptly to maintain its accuracy.</p>
<h2>Account Security</h2>
<p>You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer or device. You agree to accept responsibility for all activities under your account or password. If you believe your account has been compromised, immediately notify us at ${mail(SERVICE_EMAIL)}.</p>
<h2>Prohibited Activities</h2>
<p>Users of the Website are strictly prohibited from:</p>
<ul>
<li>Attempting to gain unauthorized access to any portion or feature of the Website, or any other systems or networks connected to the Website;</li>
<li>Using any automated system, including but not limited to "robots," "spiders," or "offline readers," to access the Website in a manner that sends more request messages to the servers of Jawhara than a human can reasonably produce in the same period by using a conventional online web browser;</li>
<li>Engaging in any conduct that restricts or inhibits any other user from using or enjoying the Website.</li>
</ul>
<h2>Indemnification</h2>
<p>You agree to indemnify and hold Jawhara, its affiliates, officers, employees, and agents harmless from any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorney's fees) arising out of or related to your use of the Website, your breach of these Terms, or your violation of any rights of another party.</p>`,
  ),

  "limitation-of-liability": article(
    "Limitation of Liability",
    "The disclaimers and limits of liability that apply to the Jawhara Jewellery website.",
    `<h2>General Disclaimer</h2>
<p>The Website and its content are provided on an "as is" and "as available" basis without any representations or warranties of any kind, express or implied, including but not limited to warranties of title, merchantability, fitness for a particular purpose, and non-infringement. Jawhara jewellery does not guarantee that the Website will be uninterrupted, secure, or free from errors or viruses.</p>
<h2>No Liability for Third-Party Content</h2>
<p>Jawhara assumes no responsibility and shall not be liable for any third-party content, advertisements, links, or any other external content or activities that may be accessed through the Website.</p>
<h2>No Liability for Force Majeure Events</h2>
<p>Jawhara shall not be liable for any failure or delay in performing its obligations under these Terms to the extent that the failure or delay is caused by any event beyond its reasonable control, including but not limited to acts of God, war, terrorism, civil disorder, strikes, natural disasters, government orders, or failures of any public or private telecommunications networks.</p>`,
  ),

  career: article(
    "Careers",
    "Join Jawhara Jewellery — open roles and how to get in touch with our HR team.",
    `<p>Crafted with timeless artistry and exceptional attention to detail, each piece reflects heritage, elegance, and enduring beauty.</p>
<h2>Get in touch</h2>
<p><strong>Head office:</strong> Jawhara Jewellery LLC, Al Dhagaya, Old Gold Souk, Deira, Jawhara Jewellery Building, Dubai.</p>
<p><strong>Email:</strong> ${mail("careers@jawharajewellery.ae")}<br><strong>Phone:</strong> <a href="tel:+97145062000">(+971) 4 506 2000</a><br><strong>WhatsApp:</strong> <a href="https://wa.me/971507528012">(+971) 50 752 8012</a></p>
<h2>Job Openings</h2>
<h3>Retail</h3>
<ul>
<li><strong>Store manager</strong> — UAE · Full time · 2-4 years · <a href="mailto:careers@jawharajewellery.ae?subject=Store%20manager%20-%20UAE">Apply now</a></li>
<li><strong>Visual merchandiser</strong> — Oman · Full time · 2-4 years · <a href="mailto:careers@jawharajewellery.ae?subject=Visual%20merchandiser%20-%20Oman">Apply now</a></li>
<li><strong>Visual merchandiser</strong> — Kuwait · Full time · 2-4 years · <a href="mailto:careers@jawharajewellery.ae?subject=Visual%20merchandiser%20-%20Kuwait">Apply now</a></li>
</ul>`,
  ),
};

/** Shape the existing view/metadata code already understands. */
export function toContentPage(handle: string, source: Article): ContentPage {
  return { handle, ...source };
}
