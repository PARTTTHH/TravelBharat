// Curated headlines and rich narrative data for Iconic Indian Places & Monuments

export const PLACE_HERITAGE_STORIES = {
  "gateway-of-india": {
    headline: "Mumbai's majestic icon",
    tagline: "Standing proudly at a height of 26 meters on the Apollo Bunder waterfront",
    deep_info: [
      "Standing proudly at a height of 26 meters, the arch is crafted from vibrant yellow basalt and concrete and adorned with a myriad of intricate Muslim and Hindu motifs that tell tales of a rich cultural tapestry. The central dome, a testament to Muslim architectural grace, captures the gaze with its impressive 48-foot diameter and an apex that reaches a staggering 83 feet.",
      "Commissioned to commemorate the landing of King George V and Queen Mary at Apollo Bunder on their visit to India in 1911, the structure was designed by Scottish architect George Wittet. It later marked the ceremonial departure of the last British troops in 1948, symbolizing India's transition to independence.",
      "Today, the Gateway of India stands as the premier gathering hub of Mumbai, overlooking the Arabian Sea, the iconic Taj Mahal Palace Hotel, and serving as the passenger ferry jetty for voyages to the ancient Elephanta Caves."
    ]
  },
  "taj-mahal": {
    headline: "An immortal poem in white marble",
    tagline: "A universally admired masterpiece of world heritage and timeless love",
    deep_info: [
      "Rising gracefully on the southern bank of the Yamuna River in Agra, the Taj Mahal is an ivory-white marble mausoleum commissioned in 1631 by Mughal Emperor Shah Jahan to house the tomb of his beloved wife, Mumtaz Mahal.",
      "The monument is a sublime pinnacle of Mughal architecture, seamlessly fusing elements of Persian, Islamic, and Indian design. Its symmetrical garden layout, reflecting pools, delicate calligraphy, and semi-precious stone Pietra Dura inlay work attract millions of admirers from across the globe.",
      "Recognized as a UNESCO World Heritage Site and one of the New Seven Wonders of the World, the Taj Mahal changes colors throughout the day, glowing golden in the morning light, dazzling white at noon, and turning ethereal silver under the full moon."
    ]
  },
  "hawa-mahal": {
    headline: "The Palace of Breeze and Latticed Splendor",
    tagline: "An iconic crown-shaped sandstone palace in the heart of the Pink City",
    deep_info: [
      "Constructed in 1799 by Maharaja Sawai Pratap Singh and designed by Lal Chand Ustad, the Hawa Mahal (Palace of Breeze) is a five-story pyramid-shaped façade built from pink and red sandstone.",
      "Featuring 953 exquisitely carved small casements called Jharokhas, the unique latticework allowed royal women to observe daily street festivities and vibrant city life while preserving strict privacy and letting refreshing mountain breezes circulate through the palace.",
      "Its distinct honeycomb structure resembles the crown of Lord Krishna, making it one of the most recognizable and photographed architectural landmarks in India."
    ]
  },
  "golden-temple": {
    headline: "The Golden Sanctuary of Peace and Equality",
    tagline: "The spiritual heart of Sikhism surrounded by the sacred Amrit Sarovar",
    deep_info: [
      "Sri Harmandir Sahib, popularly known as the Golden Temple, is the spiritual center of Sikhism located in Amritsar, Punjab. Founded in 1577 by Guru Ram Das Ji, its gold-leaf cladding was completed in 1830 by Maharaja Ranjit Singh.",
      "Built on a lower level than the surrounding terrain with four open entryways symbolizing that people of all religions, castes, and backgrounds are equally welcome, the temple sits serenely in the center of the sacred pool of nectar (Amrit Sarovar).",
      "The temple operates the world's largest free community kitchen (Langar), serving over 100,000 wholesome vegetarian meals every single day to all visitors without discrimination."
    ]
  },
  "elephanta-caves": {
    headline: "Ancient rock-cut sanctuary of Lord Shiva",
    tagline: "Magnificent 5th-century bas-relief sculptures on Elephanta Island",
    deep_info: [
      "Located on Gharapuri Island in Mumbai Harbour, the Elephanta Caves are a UNESCO World Heritage collection of rock-cut cave temples predominantly dedicated to the Hindu deity Shiva.",
      "Dating back to between the 5th and 7th centuries CE, the central cave is renowned for its monumental 20-foot three-headed sculpture of Sadashiva (Trimurti), representing Shiva as the Creator, Preserver, and Destroyer of the universe.",
      "A scenic ferry journey across Mumbai harbour transports travelers from the bustle of Apollo Bunder directly to this timeless island sanctuary of ancient rock craftsmanship."
    ]
  }
};

// Fallback helper for any place from DB
export const getPlaceData = (slug, name, cityName, stateName, description, historicalSignificance) => {
  const normSlug = (slug || '').toLowerCase().trim();
  const formattedName = name || normSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const locationLabel = cityName ? `${cityName}, ${stateName}` : (stateName || "India");

  if (PLACE_HERITAGE_STORIES[normSlug]) {
    return {
      headline: PLACE_HERITAGE_STORIES[normSlug].headline,
      tagline: PLACE_HERITAGE_STORIES[normSlug].tagline,
      deep_info: PLACE_HERITAGE_STORIES[normSlug].deep_info
    };
  }

  const chunks = [];
  if (description) {
    chunks.push(description);
  } else {
    chunks.push(`${formattedName} is an iconic destination located in ${locationLabel}, renowned for its unique cultural heritage, breathtaking views, and architectural grandeur.`);
  }

  if (historicalSignificance) {
    chunks.push(historicalSignificance);
  } else {
    chunks.push(`Steeped in rich history and regional traditions, ${formattedName} continues to attract travelers and historians seeking to experience the authentic living heritage of India.`);
  }

  return {
    headline: `${formattedName} — A Treasure of ${cityName || stateName || 'India'}`,
    tagline: `Discover the architectural wonder, stories, and heritage of ${formattedName}`,
    deep_info: chunks
  };
};
