const puppeteer = require('puppeteer');
const globals = require('../../globals');
const chai = require('chai');
chai.use(require('chai-string'));
const expect = chai.expect;

const open = async () => {
  global.browser = await puppeteer.launch({headless: false, args: [`--window-size=${1280},${1054}`]});
};

const accessToBo = async () => {
  const pages = await browser.pages();
  global.page = await pages[0];
  await page.tracing.start({
    path: '8710.json',
    categories: ['devtools.timeline']
  });
  await page.goto(global.URL + '/admin-dev');
  await page.setViewport({width: 0, height: 0});
  await page.waitFor('body').then(() => console.log('should check that the authentication page is well opened'));
};

const signInBo = async () => {
  await page.waitFor('#email');
  await page.type('#email', global.email);
  await page.waitFor('#passwd');
  await page.type('#passwd', global.password);
  await page.click('#submit_login').then(() => console.log('should login successfully in the Back Office'));
  await page.waitFor('body').then(() => console.log('should check that the dashboard page is well opened'));
};

const createProduct = async (productData) => {
  await page.waitFor('#subtab-AdminCatalog');
  await page.click('#subtab-AdminCatalog');
  await page.waitFor(1000);
  await page.waitFor('#subtab-AdminProducts');
  await page.click('#subtab-AdminProducts').then(() => console.log('should go to "Products" page'));
  await page.waitFor(2000);
  await page.waitFor('#page-header-desc-configuration-add');
  await page.click('#page-header-desc-configuration-add').then(() => console.log('should click on "New product" button'));
  await page.waitFor(2000);
  await page.waitFor('#form_step1_name_1');
  await page.type('#form_step1_name_1', productData.name + global.dateTime).then(() => console.log('should set the "Name" input'));
  await page.waitFor('#show_variations_selector > div:nth-child(3) > label > input[type="radio"]');
  await page.click('#show_variations_selector > div:nth-child(3) > label > input[type="radio"]').then(() => console.log('should click on "Product with combinations" radio button'));
  await page.waitFor('#form_step6_reference');
  await page.type('#form_step6_reference', productData.reference).then(() => console.log('should set the "Reference" input'));
  await page.waitFor('#form_step1_qty_0_shortcut');
  await page.$eval('#form_step1_qty_0_shortcut', (el, value) => el.value = value, productData.quantity).then(() => console.log('should set the quantity of product"'));
  await page.waitFor(2000);
  const exist = await page.$('a[title="Close Toolbar"]', {visible: true});
  if (exist !== null) {
    await page.click('a[title="Close Toolbar"]');
  }
};

const getInformation = async () => {
  await page.waitFor('#subtab-AdminCatalog');
  await page.click('#subtab-AdminCatalog');
  await page.waitFor(1000);
  await page.waitFor('#subtab-AdminParentAttributesGroups > a');
  await page.click('#subtab-AdminParentAttributesGroups > a').then(() => console.log('should go to Attribute & Features menu'));
  await page.waitFor('input[name*="attribute_groupFilter_b!name"]');
  await page.type('input[name*="attribute_groupFilter_b!name"]', 'size');
  await page.waitFor('button[name*="submitFilter"]');
  await page.click('button[name*="submitFilter"]').then(() => console.log('should search for the sizes value'));
  await page.waitFor('#tr_2_1_0 > td:nth-child(4)');
  await page.waitFor(2000);
  global.sizeValues = await page.$eval('#tr_2_1_0 > td:nth-child(4)', el => el.innerText, {visible: true});
  await page.waitFor('button[name*="submitResetattribute_group"]');
  await page.click('button[name*="submitResetattribute_group"]').then(() => console.log('should click on reset button'));
  await page.waitFor('input[name*="attribute_groupFilter_b!name"]');
  await page.type('input[name*="attribute_groupFilter_b!name"]', 'color');
  await page.waitFor('button[name*="submitFilter"]');
  await page.click('button[name*="submitFilter"]').then(() => console.log('should search for the colors value'));
  await page.waitFor('#tr_2_2_1 > td:nth-child(4)');
  await page.waitFor(2000);
  global.colorValues = await page.$eval('#tr_2_2_1 > td:nth-child(4)', el => el.innerText, {visible: true});
  await page.waitFor('button[name*="submitResetattribute_group"]');
  await page.click('button[name*="submitResetattribute_group"]').then(() => console.log('should click on reset button'));
  await page.waitFor('input[name*="attribute_groupFilter_b!name"]');
  await page.type('input[name*="attribute_groupFilter_b!name"]', 'Dimension');
  await page.waitFor('button[name*="submitFilter"]');
  await page.click('button[name*="submitFilter"]').then(() => console.log('should search for the dimensions value'));
  await page.waitFor('#tr_2_3_2 > td:nth-child(4)');
  await page.waitFor(2000);
  global.dimensionValues = await page.$eval('#tr_2_3_2 > td:nth-child(4)', el => el.innerText, {visible: true});
};

const createCombinations = async () => {
  await page.waitFor('#tab_step3 > a');
  await page.click('#tab_step3 > a').then(() => console.log('Go to combinations tab'));
  for (let i = 1; i <= sizeValues; i++) {
    await page.waitFor('#attribute-group-1 > div > div:nth-child(' + i + ') > label > span');
    await page.click('#attribute-group-1 > div > div:nth-child(' + i + ') > label > span').then(() => console.log('should select all the sizes'));
  }
  for (let i = 1; i <= colorValues; i++) {
    await page.waitFor('#attribute-group-2 > div > div:nth-child(' + i + ') > label > span');
    await page.click('#attribute-group-2 > div > div:nth-child(' + i + ') > label > span').then(() => console.log('should select all the colors'));
  }
  for (let i = 1; i <= dimensionValues; i++) {
    await page.waitFor('#attribute-group-3 > div > div:nth-child(' + i + ') > label > span');
    await page.click('#attribute-group-3 > div > div:nth-child(' + i + ') > label > span').then(() => console.log('should select all the dimensions'));
  }
  await page.waitFor('#create-combinations');
  await page.click('#create-combinations', {delay: 3000}).then(() => console.log('should click on "Generate button"'));
  await page.waitFor(5000);
  await page.reload({timeout: 90000});
  await page.waitFor(5000);
  await page.waitFor('#accordion_combinations > tr:nth-child(1)', {visible: true, timeout: 90000}).then(() => console.log('should check the appearance of combinations'));
  await page.$eval('#accordion_combinations > tr:nth-child(1) > td.attribute-quantity > div > input', (el, value) => el.value = value, 50);
  await page.waitFor(2000);
  await page.$eval('#accordion_combinations > tr:nth-child(2) > td.attribute-quantity > div > input', (el, value) => el.value = value, 50);
  await page.waitFor(2000);
  await page.waitFor('div.dropdown > button[type="submit"]');
  await page.$eval('div.dropdown > button[type="submit"]', el => el.click(), {visible: true, timeout: 90000})
    .then(() => console.log('should click on "Save" button'));
  await page.waitFor('#form > div.col-md-10.has-danger > ul > li',{visible: true, timeout: 90000});
  const message = await page.$eval('#form > div.col-md-10.has-danger > ul > li', el => el.innerText, {visible: true});
  if (message === 'The CSRF token is invalid. Please try to resubmit the form.') {
    console.log('not saved')
  }
};
                                  
let productData = {
  name: 'P1',
  reference: 'P8710',
  quantity: '10',
  discount: '4'
};

/** This scenario is based on the bug described in this PR
 * https://github.com/PrestaShop/PrestaShop/pull/8710
 */

open()
  .then(() => console.log('should open the browser'))
  .then(() => {
    accessToBo().then(async () => {
      await signInBo();
      await getInformation();
      await createProduct(productData);
      await createCombinations();
      await page.tracing.stop();
      await browser.close();
    });
  });