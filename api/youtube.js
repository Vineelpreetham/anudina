export default async function handler(req, res) {
  // Allow cross-origin requests (CORS) if needed
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { playlistId } = req.query;
  const API_KEY = process.env.YOUTUBE_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'YOUTUBE_API_KEY environment variable is missing.' });
  }

  if (!playlistId) {
    return res.status(400).json({ error: 'playlistId parameter is required.' });
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=12&key=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('YouTube API Error:', data);
      return res.status(response.status).json({ error: data.error.message || 'Error fetching from YouTube' });
    }

    // Format the data into a clean structure for the frontend
    const videos = data.items.map(item => {
      const snippet = item.snippet;
      return {
        id: snippet.resourceId.videoId,
        title: snippet.title,
        description: snippet.description,
        thumbnailUrl: snippet.thumbnails.maxres ? snippet.thumbnails.maxres.url : snippet.thumbnails.high.url,
        publishedAt: snippet.publishedAt,
        channelTitle: snippet.channelTitle
      };
    }).filter(video => video.title !== 'Private video' && video.title !== 'Deleted video');

    // VERY IMPORTANT: Cache at the Edge for 1 Hour (3600 seconds)
    // This protects the API quota when 5000+ users hit the site
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    
    return res.status(200).json({ videos });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
