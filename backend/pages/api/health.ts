import { NextApiRequest, NextApiResponse } from 'next'

// Health check endpoint to keep Railway warm
// Call this every 5 minutes to prevent cold starts
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    return res.status(200).json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    })
  }
  
  return res.status(405).json({ error: 'Method not allowed' })
}
