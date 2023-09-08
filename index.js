const { default: puppeteer } = require('puppeteer')
const fs = require('fs')
const{writeFile}=require('fs/promises')
const { load } = require('cheerio')
const{parse}=require('json2csv')

const main = async () => {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: {
        height: 768,
        width: 1366
      }
    })

const page = await browser.newPage()
  await page.goto('https://www.reliancedigital.in/')
  await page.waitForTimeout(3000)
  
//   await page.keyboard.press('Enter')
  await page.click('#wzrk-cancel')
  await page.type('#suggestionBoxEle', 'laptops')
  await page.keyboard.press('Enter')
  
  await page.waitForNetworkIdle()
  
  const productsData = []
  const $ = load(await page.content())
  $('.pl__container li').each((_, el) => {
    const given= $('.sp__name',el).text()
    const parts = given.split("(")
    const name = parts[0]
    const desc = parts.splice(1,1).join(" ").replace(")","")
    const image= $('.lazy-load-image-loaded-blur.blur.lazy-load-image-background',el).find('img').attr('src')
    const price= $('.gimCrs',el).text()
    let orig_price= $('.hXRlvW',el).text()
    let discount_given= $('.jhOcrk',el).text();
    if(discount_given==""){
        discount_given="0%(₹0)"
        orig_price=price
    }
    // console.log({name,desc,image,price,orig_price,discount_given})
    productsData.push({name,desc,image,price,orig_price,discount_given});
  })
  await writeFile('products.json', JSON.stringify(productsData))
  await browser.close()
  fs.writeFileSync('products.csv',parse(productsData));
}


main()