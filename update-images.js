const puppeteer = require('puppeteer');

const imageUrl = 'https://example.com/image.jpg';
const imageName = 'image.jpg';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: false, defaultViewport: {width: 1400, height: 800}});
  const page = await browser.newPage();
  // await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36');

  await page.goto('https://www.instagram.com/_lampison/');
  await page.waitForSelector('section main article', {visible: true});

  const imageList = await page.$$eval('article a', (links) => {
    
    const images = links.slice(0, 12).map((link) => {
      return {
        src: link.querySelector('img').getAttribute('src'),
        url: 'https://www.instagram.com' + link.getAttribute('href')
      }
    });
    return images;
  });

  await browser.close();

  // console.log(JSON.stringify(imageList));
  const https = require('https');
  const fs = require('fs');
  for (var i = 0; i < imageList.length; i++) {
    const image = imageList[i];
    https.get(image.src, (res) => {
      const regex = /\/([^/]+\.(jpg|jpeg|png|gif))/i;
      const match = image.src.match(regex);
      if (match) {
        const fileName = 'images/'+match[1];
        imageList[i].src = fileName;
        const fileStream = fs.createWriteStream(fileName);
          res.pipe(fileStream);
          
          fileStream.on('finish', () => {
            console.log(`Image downloaded to ${fileName}`);
          });
      } else {
        console.log('No file name found in URL');
      }
      
    }).on('error', (err) => {
      console.error(err);
    });
  }

  fs.readFile('index.html', 'utf8', (err, data) => {
    if (err) throw err;

    const newValue = JSON.stringify(imageList);

    const newData = data.replace(
      new RegExp(`const instagramImages.*`, 'g'),
      `const instagramImages = ${newValue};`
    );

    fs.writeFile('index.html', newData, 'utf8', (err) => {
      if (err) throw err;
      console.log('File saved successfully');
    });
  });

  
})();
