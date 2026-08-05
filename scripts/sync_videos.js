const fs = require('fs');
const https = require('https');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
let API_KEY = '';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/YOUTUBE_API_KEY=(.*)/);
  if (match) API_KEY = match[1].trim();
}

if (!API_KEY) {
  console.error("❌ YOUTUBE_API_KEY not found in .env file.");
  process.exit(1);
}

const PLAYLIST_ID = 'PLoHBupRP7Cq34LN32sW1X7NVrozJSD-sz';

const BOOK_NAMES = [
  "Song of Solomon", "1 Thessalonians", "2 Thessalonians",
  "1 Corinthians", "2 Corinthians", "1 Chronicles", "2 Chronicles",
  "Lamentations", "Deuteronomy", "Ecclesiastes", "Philippians",
  "Colossians", "Revelation", "Zechariah", "Zephaniah",
  "Leviticus", "Nehemiah", "Galatians", "Ephesians", "Philemon",
  "Proverbs", "Habakkuk", "1 Samuel", "2 Samuel", "1 Timothy", "2 Timothy",
  "Jeremiah", "Ezekiel", "Obadiah", "Malachi", "Matthew", "Hebrews",
  "Genesis", "Numbers", "1 Kings", "2 Kings", "1 Peter", "2 Peter",
  "Exodus", "Joshua", "Judges", "Esther", "Isaiah", "Daniel",
  "Haggai", "Romans", "1 John", "2 John", "3 John",
  "Psalms", "Psalm", "Hosea", "Micah", "Nahum", "Titus", "James",
  "Ruth", "Ezra", "Job", "Joel", "Amos", "Jonah", "Mark", "Luke", "John", "Acts", "Jude"
];

const mappedVideos = {};

function fetchPlaylistPage(pageToken = '') {
  return new Promise((resolve, reject) => {
    let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${PLAYLIST_ID}&key=${API_KEY}`;
    if (pageToken) url += `&pageToken=${pageToken}`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function syncVideos() {
  console.log("🔄 Fetching videos from YouTube playlist...");
  let pageToken = '';
  let totalFetched = 0;
  let allItems = [];

  do {
    const data = await fetchPlaylistPage(pageToken);
    if (data.error) {
      console.error("❌ YouTube API Error:", data.error.message);
      process.exit(1);
    }

    if (data.items) {
      allItems.push(...data.items);
      totalFetched += data.items.length;
      console.log(`Fetched ${totalFetched} videos...`);
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  console.log(`✅ Fetched a total of ${allItems.length} videos. Mapping to books...`);

  for (const item of allItems) {
    const title = item.snippet.title;
    if (title === 'Private video' || title === 'Deleted video') continue;

    const titleLower = title.toLowerCase();
    let matchedBook = null;

    for (let book of BOOK_NAMES) {
      if (titleLower.startsWith(book.toLowerCase())) {
        matchedBook = book;
        break;
      }
    }

    if (matchedBook === "Psalm") matchedBook = "Psalms";

    if (matchedBook) {
      if (!mappedVideos[matchedBook]) mappedVideos[matchedBook] = [];
      
      mappedVideos[matchedBook].push({
        id: item.snippet.resourceId.videoId,
        title: title,
        thumbnailUrl: item.snippet.thumbnails?.maxres?.url || item.snippet.thumbnails?.high?.url || '',
        channelTitle: item.snippet.channelTitle
      });
    } else {
      console.log(`⚠️ Could not map video to any book: "${title}"`);
    }
  }

  const outputPath = path.join(__dirname, '..', 'videos.json');
  fs.writeFileSync(outputPath, JSON.stringify(mappedVideos, null, 2));
  console.log(`\n🎉 Success! mapped ${Object.keys(mappedVideos).length} books.`);
  console.log(`Saved perfectly structured data to ${outputPath}`);
}

syncVideos();
