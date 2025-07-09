import { NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address') // full string: "123 Main St Dallas TX 75201"

  if (!address) {
    return NextResponse.json({ error: 'Missing address' }, { status: 400 })
  }

  const url = `https://www.zillow.com/homes/${encodeURIComponent(address.replace(/\s+/g, '-'))}_rb/`

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 })

    const zestimate = await page.evaluate(() => {
      const match = [...document.body.innerText.matchAll(/\$[\d,]+(?:\.\d{2})?/g)]
      return match.length ? match[0][0] : null
    })

    await browser.close()
    return NextResponse.json({ zestimate: zestimate || 'Not Found' })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch Zestimate' }, { status: 500 })
  }
}
