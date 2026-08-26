#!/usr/bin/env node
/**
 * Create the Salt Church Tally kit.
 *
 * Usage:
 *   export TALLY_API_KEY=$(op read "op://salt-studio-development/tally/credential")
 *   node scripts/tally/church-kit.mjs
 *
 * Create only, unless you pass --refresh=<key> for a non-protected kit form.
 * Never PATCHes PROTECTED_TALLY_FORM_IDS.
 */
import {execSync} from 'node:child_process'
import {randomUUID} from 'node:crypto'

const API_BASE = 'https://api.tally.so'
const TALLY_VERSION = '2025-02-01'
const FOLDER_NAME = 'Church kit'
const TITLE_PREFIX = 'Salt Church — '

const PROTECTED_TALLY_FORM_IDS = new Set([
  '1AOReW',
  'oblYeV',
  'MePV4X',
  'J9GoPd',
  'gDgzld',
  'yPg1Q4',
  'Xx9Qa4',
  '812rBx',
  'ZjjkEe',
  'eqYXjq',
])

function getApiKey() {
  if (process.env.TALLY_API_KEY) return process.env.TALLY_API_KEY
  try {
    return execSync('op read "op://salt-studio-development/tally/credential"', {
      encoding: 'utf8',
    }).trim()
  } catch {
    throw new Error('TALLY_API_KEY not set and 1Password read failed')
  }
}

function uid() {
  return randomUUID()
}

function schemaText(text) {
  return {safeHTMLSchema: [[text]]}
}

class FormBuilder {
  constructor() {
    this.blocks = []
    this.pageBreakIndex = 0
  }

  formTitle(title, buttonLabel) {
    const groupUuid = uid()
    this.blocks.push({
      uuid: uid(),
      type: 'FORM_TITLE',
      groupUuid,
      groupType: 'FORM_TITLE',
      payload: {
        title,
        safeHTMLSchema: [[title]],
        button: {label: buttonLabel},
      },
    })
    return this
  }

  intro(text) {
    this.blocks.push({
      uuid: uid(),
      type: 'TEXT',
      groupUuid: uid(),
      groupType: 'TEXT',
      payload: schemaText(text),
    })
    return this
  }

  churchName() {
    this.heading2('Your church')
    this.inputText('What is the name of your church?', {
      required: true,
      placeholder: 'e.g., First Assembly',
    })
    return this
  }

  heading1(text) {
    this.blocks.push({
      uuid: uid(),
      type: 'HEADING_1',
      groupUuid: uid(),
      groupType: 'HEADING_1',
      payload: schemaText(text),
    })
    return this
  }

  heading2(text) {
    this.blocks.push({
      uuid: uid(),
      type: 'HEADING_2',
      groupUuid: uid(),
      groupType: 'HEADING_2',
      payload: schemaText(text),
    })
    return this
  }

  hint(text) {
    this.blocks.push({
      uuid: uid(),
      type: 'TEXT',
      groupUuid: uid(),
      groupType: 'TEXT',
      payload: schemaText(text),
    })
    return this
  }

  pageBreak(name, pageUuid = uid()) {
    this.blocks.push({
      uuid: pageUuid,
      type: 'PAGE_BREAK',
      groupUuid: uid(),
      groupType: 'PAGE_BREAK',
      payload: {
        index: this.pageBreakIndex++,
        name,
      },
    })
    this.lastPage = pageUuid
    return this
  }

  inputText(label, {required = false, placeholder = '', hint: hintText} = {}) {
    this.blocks.push({
      uuid: uid(),
      type: 'TITLE',
      groupUuid: uid(),
      groupType: 'QUESTION',
      payload: schemaText(label),
    })
    if (hintText) this.hint(hintText)
    this.blocks.push({
      uuid: uid(),
      type: 'INPUT_TEXT',
      groupUuid: uid(),
      groupType: 'INPUT_TEXT',
      payload: {
        isRequired: required,
        placeholder,
        hasMinCharacters: false,
        hasMaxCharacters: false,
        hasDefaultAnswer: false,
      },
    })
    return this
  }

  textarea(label, {required = false, placeholder = '', hint: hintText} = {}) {
    this.blocks.push({
      uuid: uid(),
      type: 'TITLE',
      groupUuid: uid(),
      groupType: 'QUESTION',
      payload: schemaText(label),
    })
    if (hintText) this.hint(hintText)
    this.blocks.push({
      uuid: uid(),
      type: 'TEXTAREA',
      groupUuid: uid(),
      groupType: 'TEXTAREA',
      payload: {
        isRequired: required,
        placeholder,
        hasMinCharacters: false,
        hasMaxCharacters: false,
        hasDefaultAnswer: false,
      },
    })
    return this
  }

  inputEmail(label, {required = false, placeholder = '', hint: hintText} = {}) {
    this.blocks.push({
      uuid: uid(),
      type: 'TITLE',
      groupUuid: uid(),
      groupType: 'QUESTION',
      payload: schemaText(label),
    })
    if (hintText) this.hint(hintText)
    this.blocks.push({
      uuid: uid(),
      type: 'INPUT_EMAIL',
      groupUuid: uid(),
      groupType: 'INPUT_EMAIL',
      payload: {
        isRequired: required,
        placeholder,
        hasDefaultAnswer: false,
      },
    })
    return this
  }

  inputLink(label, {required = false, placeholder = '', hint: hintText} = {}) {
    this.blocks.push({
      uuid: uid(),
      type: 'TITLE',
      groupUuid: uid(),
      groupType: 'QUESTION',
      payload: schemaText(label),
    })
    if (hintText) this.hint(hintText)
    const inputUuid = uid()
    const groupUuid = uid()
    this.blocks.push({
      uuid: inputUuid,
      type: 'INPUT_LINK',
      groupUuid,
      groupType: 'INPUT_LINK',
      payload: {
        isRequired: required,
        placeholder,
        hasDefaultAnswer: false,
      },
    })
    this.lastField = {
      uuid: inputUuid,
      type: 'INPUT_FIELD',
      questionType: 'INPUT_LINK',
      blockGroupUuid: groupUuid,
      title: label,
    }
    return this
  }

  inputPhone(label, {required = false, placeholder = '', hint: hintText} = {}) {
    this.blocks.push({
      uuid: uid(),
      type: 'TITLE',
      groupUuid: uid(),
      groupType: 'QUESTION',
      payload: schemaText(label),
    })
    if (hintText) this.hint(hintText)
    this.blocks.push({
      uuid: uid(),
      type: 'INPUT_PHONE_NUMBER',
      groupUuid: uid(),
      groupType: 'INPUT_PHONE_NUMBER',
      payload: {
        isRequired: required,
        placeholder,
        internationalFormat: true,
        defaultCountryCode: 'CA',
        hasDefaultAnswer: false,
      },
    })
    return this
  }

  inputNumber(label, {required = false, placeholder = '', hint: hintText} = {}) {
    this.blocks.push({
      uuid: uid(),
      type: 'TITLE',
      groupUuid: uid(),
      groupType: 'QUESTION',
      payload: schemaText(label),
    })
    if (hintText) this.hint(hintText)
    this.blocks.push({
      uuid: uid(),
      type: 'INPUT_NUMBER',
      groupUuid: uid(),
      groupType: 'INPUT_NUMBER',
      payload: {
        isRequired: required,
        placeholder,
        hasMinNumber: false,
        hasMaxNumber: false,
        hasDefaultAnswer: false,
      },
    })
    return this
  }

  inputDate(label, {required = false, hint: hintText} = {}) {
    this.blocks.push({
      uuid: uid(),
      type: 'TITLE',
      groupUuid: uid(),
      groupType: 'QUESTION',
      payload: schemaText(label),
    })
    if (hintText) this.hint(hintText)
    this.blocks.push({
      uuid: uid(),
      type: 'INPUT_DATE',
      groupUuid: uid(),
      groupType: 'INPUT_DATE',
      payload: {
        isRequired: required,
        hasDefaultAnswer: false,
      },
    })
    return this
  }

  inputTime(label, {required = false, hint: hintText} = {}) {
    this.blocks.push({
      uuid: uid(),
      type: 'TITLE',
      groupUuid: uid(),
      groupType: 'QUESTION',
      payload: schemaText(label),
    })
    if (hintText) this.hint(hintText)
    this.blocks.push({
      uuid: uid(),
      type: 'INPUT_TIME',
      groupUuid: uid(),
      groupType: 'INPUT_TIME',
      payload: {
        isRequired: required,
        hasDefaultAnswer: false,
      },
    })
    return this
  }

  dropdown(label, options, {required = false, hint: hintText} = {}) {
    this.blocks.push({
      uuid: uid(),
      type: 'TITLE',
      groupUuid: uid(),
      groupType: 'QUESTION',
      payload: schemaText(label),
    })
    if (hintText) this.hint(hintText)
    const groupUuid = uid()
    options.forEach((text, index) => {
      this.blocks.push({
        uuid: uid(),
        type: 'DROPDOWN_OPTION',
        groupUuid,
        groupType: 'DROPDOWN',
        payload: {
          index,
          isFirst: index === 0,
          isLast: index === options.length - 1,
          text,
          isRequired: required && index === 0,
          hasDefaultAnswer: false,
        },
      })
    })
    return this
  }

  multipleChoice(label, options, {required = false, hint: hintText} = {}) {
    this.blocks.push({
      uuid: uid(),
      type: 'TITLE',
      groupUuid: uid(),
      groupType: 'QUESTION',
      payload: schemaText(label),
    })
    if (hintText) this.hint(hintText)
    const groupUuid = uid()
    const choiceOptions = options.map((text, index) => {
      const optionUuid = uid()
      this.blocks.push({
        uuid: optionUuid,
        type: 'MULTIPLE_CHOICE_OPTION',
        groupUuid,
        groupType: 'MULTIPLE_CHOICE',
        payload: {
          index,
          isFirst: index === 0,
          isLast: index === options.length - 1,
          text,
          isRequired: required && index === 0,
          allowMultiple: false,
          hasDefaultAnswer: false,
        },
      })
      return {text, uuid: optionUuid}
    })
    this.lastChoice = {
      title: label,
      groupUuid,
      options: choiceOptions,
      field: {
        uuid: choiceOptions[0].uuid,
        type: 'INPUT_FIELD',
        questionType: 'MULTIPLE_CHOICE_OPTION',
        blockGroupUuid: groupUuid,
        title: label,
      },
    }
    return this
  }

  whenChoiceIs(choice, optionText, actions) {
    const option = choice.options.find((entry) => entry.text === optionText)
    if (!option) {
      throw new Error(`No choice option "${optionText}" on "${choice.title}"`)
    }
    this.blocks.push({
      uuid: uid(),
      type: 'CONDITIONAL_LOGIC',
      groupUuid: uid(),
      groupType: 'CONDITIONAL_LOGIC',
      payload: {
        logicalOperator: 'AND',
        updateUuid: null,
        conditionals: [
          {
            uuid: uid(),
            type: 'SINGLE',
            payload: {
              field: choice.field,
              comparison: 'IS',
              value: option.uuid,
            },
          },
        ],
        actions,
      },
    })
    return this
  }

  checkboxes(label, options, {required = false, hint: hintText} = {}) {
    this.blocks.push({
      uuid: uid(),
      type: 'TITLE',
      groupUuid: uid(),
      groupType: 'QUESTION',
      payload: schemaText(label),
    })
    if (hintText) this.hint(hintText)
    const groupUuid = uid()
    options.forEach((text, index) => {
      this.blocks.push({
        uuid: uid(),
        type: 'CHECKBOX',
        groupUuid,
        groupType: 'CHECKBOXES',
        payload: {
          index,
          isFirst: index === 0,
          isLast: index === options.length - 1,
          text,
          isRequired: required && index === 0,
          hasDefaultAnswer: false,
        },
      })
    })
    return this
  }

  fileUpload(label, {required = false, multiple = false, maxFiles = 1, hint: hintText} = {}) {
    this.blocks.push({
      uuid: uid(),
      type: 'TITLE',
      groupUuid: uid(),
      groupType: 'QUESTION',
      payload: schemaText(label),
    })
    if (hintText) this.hint(hintText)
    this.blocks.push({
      uuid: uid(),
      type: 'FILE_UPLOAD',
      groupUuid: uid(),
      groupType: 'FILE_UPLOAD',
      payload: {
        isRequired: required,
        hasMultipleFiles: multiple,
        hasMinFiles: false,
        hasMaxFiles: multiple && maxFiles > 1,
        maxFiles: multiple ? maxFiles : undefined,
        hasMaxFileSize: false,
      },
    })
    return this
  }

  build() {
    return this.blocks
  }
}

const PULL_FROM_SITE = 'Yes — pull what you can from the site'
const FILL_IT_IN = 'No — I will fill it in'
const NO_WEBSITE = 'I do not have a current website'

function buildGettingStartedForm() {
  const pages = {
    churchInfo: uid(),
    voice: uid(),
    pco: uid(),
    links: uid(),
    media: uid(),
    domain: uid(),
  }
  const b = new FormBuilder()
  b.formTitle('Church Project Kickoff', 'Submit Getting Started')
    .intro(
      'This is the one form that kicks off your church website project. Book the kickoff call separately, then fill this out so we have everything we need to start.',
    )
    .heading2('About you')
    .inputText('Your name', {required: true, placeholder: 'Alex Smith'})
    .inputEmail('Email', {required: true, placeholder: 'alex@church.com'})
    .churchName()
    .inputLink('Current website', {
      placeholder: 'https://',
      hint: 'Required if you want us to pull info from the site.',
    })
  const websiteField = b.lastField
  b.multipleChoice(
    'Get this info from your current website?',
    [PULL_FROM_SITE, FILL_IT_IN, NO_WEBSITE],
    {
      required: true,
      hint: 'We can take mission, Sunday expect, address, links, and sermons from the site. You still answer voice samples, Planning Center, and domain.',
    },
  )
  const scrapeChoice = b.lastChoice
  b.whenChoiceIs(scrapeChoice, PULL_FROM_SITE, [
    {
      uuid: uid(),
      type: 'REQUIRE_ANSWER',
      payload: {requireAnswer: websiteField.uuid},
    },
    {
      uuid: uid(),
      type: 'JUMP_TO_PAGE',
      payload: {jumpToPage: pages.voice},
    },
  ])
    .textarea('What feels out of alignment?', {
      required: true,
      placeholder: 'What is not working about your current site, message, or digital presence?',
    })
    .textarea('What would success look like?', {
      required: true,
      placeholder: 'Clearer first-time visitor path, easier giving, a site that sounds like you…',
    })
    .textarea('Timeline and scope notes', {
      placeholder: 'Launch target, must-have pages, anything we should know before the call.',
    })
    .fileUpload('Files we should see before the call', {
      multiple: true,
      maxFiles: 10,
      hint: 'Optional. Briefs, brand docs, or screenshots.',
    })
    .inputLink('Links we should see before the call', {
      placeholder: 'https://',
      hint: 'Optional. Drive folder, Figma, or a reference site.',
    })
    .pageBreak('Church info', pages.churchInfo)
    .heading2('Church info')
    .textarea('Mission statement', {
      required: true,
      placeholder: 'What you exist to do, in 1–2 sentences.',
    })
    .textarea('Vision statement', {
      required: true,
      placeholder: 'Where the church is headed.',
    })
    .textarea('Core values', {
      placeholder: 'Community — We belong to each other\nGenerosity — We give first',
      hint: 'One value per line. Title, then a short why.',
    })
    .fileUpload('Statement of faith (file)', {
      hint: 'PDF, DOC, DOCX, or TXT.',
    })
    .textarea('Statement of faith (or paste it here)', {
      placeholder: 'Paste the text if you do not have a file.',
    })
    .heading2('What to expect on a Sunday')
    .inputText('Typical service length', {
      required: true,
      placeholder: 'e.g., About 75 minutes',
    })
    .inputText('Dress code', {placeholder: 'e.g., Casual — come as you are'})
    .textarea('Parking', {required: true, placeholder: 'Where do visitors park?'})
    .textarea('Kids check-in', {
      required: true,
      placeholder: 'Drop-off, pickup, safety, what parents should expect',
    })
    .textarea('What happens after the service', {
      placeholder: 'Coffee, fellowship, prayer team, etc.',
    })
    .inputPhone('Church phone number', {required: true, placeholder: '(555) 123-4567'})
    .textarea('Office hours', {placeholder: 'e.g., Mon–Thu 9am–4pm'})
    .inputLink('Facebook URL', {placeholder: 'https://facebook.com/...'})
    .textarea('Other social links', {
      placeholder: 'Instagram, YouTube, or anything else we should link. One per line.',
    })
    .inputText('Service time wording', {
      required: true,
      placeholder: 'e.g., Sundays at 9 & 11 AM',
      hint: 'The exact wording for the site.',
    })
    .textarea('Location and address', {
      required: true,
      placeholder: 'Where you meet, including the street address.',
    })
    .multipleChoice('Do you have a named discipleship pathway?', ['Yes', 'No'], {
      hint: 'A sequence of stages people move through (welcome, grow, serve, etc.).',
    })
    .inputText('What are the stages called?', {
      placeholder: 'e.g., Welcome / Grow / Send',
      hint: 'Skip if you do not have named stages.',
    })
    .textarea('Church history', {
      placeholder: 'Your story and how you started.',
    })
    .pageBreak('Voice', pages.voice)
    .heading2('Voice samples')
    .hint(
      'Writing samples that capture your voice. We use these to write copy that sounds like you.',
    )
    .fileUpload('Upload at least one sample', {
      required: true,
      multiple: true,
      maxFiles: 10,
      hint: 'Newsletters, emails, bulletins, social posts — anything written. PDF, DOC, DOCX, TXT.',
    })
    .pageBreak('Planning Center', pages.pco)
    .heading2('Planning Center')
    .multipleChoice('Do you use Planning Center?', ['Yes', 'No'], {required: true})
    .checkboxes(
      'Which modules do you use?',
      [
        'People',
        'Groups',
        'Calendar',
        'Giving',
        'Check-Ins',
        'Services',
        'Registrations',
        'Publishing',
      ],
      {hint: 'Skip if you do not use Planning Center.'},
    )
    .multipleChoice(
      'Would you like us to integrate Planning Center data?',
      ['Yes, integrate', 'No, manual only'],
      {
        hint: 'We can pull groups, events, and more into the website.',
      },
    )
    .checkboxes('What should be synced?', [
      'Groups (small groups, courses)',
      'Registrations (events, courses)',
      'Calendar',
      'Also allow manual additions (not just from PCO)',
    ])
    .inputLink('Planning Center organization URL', {
      placeholder: 'https://yourchurch.planningcenteronline.com',
    })
    .inputText('If you use a different ChMS, which one?', {
      placeholder: 'e.g., Church Community Builder, Breeze',
    })
    .hint(
      'Do not put Planning Center App ID or Secret here. Share those through 1Password or a private note to Salt.',
    )
    .whenChoiceIs(scrapeChoice, PULL_FROM_SITE, [
      {
        uuid: uid(),
        type: 'JUMP_TO_PAGE',
        payload: {jumpToPage: pages.domain},
      },
    ])
    .pageBreak('Links', pages.links)
    .heading2('Important links')
    .inputLink('Giving URL', {placeholder: 'https://...'})
    .inputLink('Events / calendar URL', {placeholder: 'https://...'})
    .inputLink('Groups sign-up URL', {placeholder: 'https://...'})
    .inputLink('Volunteer sign-up URL', {placeholder: 'https://...'})
    .textarea('Other important links', {
      placeholder: 'https://...',
      hint: 'One per line.',
    })
    .pageBreak('Media', pages.media)
    .heading2('Media and apps')
    .dropdown('Where do you host sermons?', [
      'YouTube',
      'Vimeo',
      'Subsplash',
      'Podcast only',
      'Other',
    ])
    .inputLink('Sermon URL', {placeholder: 'https://...'})
    .inputLink('Livestream URL', {placeholder: 'https://...'})
    .dropdown('Do you have a church app?', [
      'No app',
      'Church Center (PCO)',
      'Subsplash',
      'Pushpay',
      'Other',
    ])
    .inputText('If other, which app?', {placeholder: 'App name'})
    .dropdown('Email newsletter platform', [
      'Mailchimp',
      'Constant Contact',
      'ConvertKit',
      'PCO Publishing',
      'Other',
      'None',
    ])
    .multipleChoice('Newsletter signup form on the website?', ['Yes', 'No'])
    .textarea('Newsletter embed code', {
      placeholder: 'Paste the embed code from your email platform.',
    })
    .pageBreak('Domain', pages.domain)
    .heading2('Domain and DNS')
    .multipleChoice('Do you already own a domain?', ['Yes', 'No'], {required: true})
    .inputText('If no, what domain would you like?', {
      placeholder: 'yourchurch.com',
      hint: 'We cover registration up to $50/year when we buy it for you.',
    })
    .inputText('If yes, your current domain', {placeholder: 'yourchurch.com'})
    .multipleChoice('How do you want to handle DNS setup?', ['I will do it', 'Do it for me'])
    .dropdown('Domain registrar', [
      'GoDaddy',
      'Namecheap',
      'Google Domains',
      'Cloudflare',
      'Other / Not sure',
    ])
    .dropdown('Email provider for your domain', [
      'Google Workspace',
      'Microsoft 365',
      'No email on this domain',
      'Other / Not sure',
    ])
    .fileUpload('Current DNS records', {
      multiple: true,
      maxFiles: 8,
      hint: 'Screenshots of your current DNS settings so we do not break email.',
    })
    .hint(
      'Do not put registrar login or password here. Share those through 1Password or a private note to Salt.',
    )
  return b.build()
}

function buildStaffBioForm() {
  const b = new FormBuilder()
  b.formTitle(`${TITLE_PREFIX}Staff Bio`, 'Submit bio')
    .intro(
      'Please fill out your information below. This will be used on the staff/leadership page of the website.',
    )
    .churchName()
    .heading2('Bio type')
    .multipleChoice('Is this a couple bio?', ['No — individual bio', 'Yes — couple bio'], {
      required: true,
      hint: 'If yes, complete the spouse fields in the sections below.',
    })
    .pageBreak('Identity')
    .heading2('Identity')
    .inputText('Full name', {
      required: true,
      placeholder: 'Alex Smith or Alex & Jordan Smith',
      hint: 'First and last name(s) as they should appear on the website.',
    })
    .inputText('Nickname or preferred name', {
      placeholder: 'Pastor Chris',
      hint: 'How you would like to be addressed publicly.',
    })
    .inputText('Job title', {required: true, placeholder: 'e.g., Lead Pastor, Worship Director'})
    .fileUpload('Profile picture', {
      required: true,
      hint: 'A clear photo of you. Square crop preferred.',
    })
    .fileUpload('Spouse headshot', {
      hint: 'Required for couple bios. Square crop preferred.',
    })
    .fileUpload('Couple photo', {
      hint: 'Required for couple bios. A photo of you both together.',
    })
    .pageBreak('Bio')
    .heading2('Bio')
    .textarea('Your bio', {
      required: true,
      placeholder:
        'Share about yourself, your background, your family, how long you have been at the church, and what you are passionate about...',
      hint: 'We will edit for tone and create a short version for staff cards.',
    })
    .textarea('First-person version', {
      placeholder: "Optional: I've been serving at...",
      hint: 'Optional personal "I" voice version. Otherwise we will adapt your bio above.',
    })
    .pageBreak('Role')
    .heading2('Role')
    .textarea('Areas of responsibility', {
      required: true,
      placeholder: 'e.g.,\nPreaching\nElder care\nStaff development',
      hint: 'One area per line. What you oversee or lead.',
    })
    .textarea("Spouse's areas of responsibility", {
      placeholder: "e.g.,\nWomen's ministry\nSmall groups",
      hint: 'For couple bios only. One area per line.',
    })
    .textarea('Favorite quote', {
      placeholder: '"For I know the plans I have for you..." — Jeremiah 29:11',
      hint: 'A scripture or quote that captures something about you. Include the source.',
    })
    .pageBreak('Contact')
    .heading2('Contact')
    .inputEmail('Email', {required: true, placeholder: 'john@church.com'})
    .inputEmail("Spouse's email", {
      placeholder: 'jane@church.com',
      hint: 'For couple bios.',
    })
    .inputPhone('Phone number / extension', {placeholder: '(555) 123-4567 ext. 101'})
    .inputLink('Instagram', {placeholder: 'https://instagram.com/yourhandle'})
    .inputLink("Spouse's Instagram", {placeholder: 'https://instagram.com/spousehandle'})
  return b.build()
}

function buildMinistryForm() {
  const b = new FormBuilder()
  b.formTitle(`${TITLE_PREFIX}Ministry`, 'Submit ministry')
    .intro(
      'A ministry is a department or program area — like Kids, Youth, Adults, or Worship. Volunteer teams (Crews) serve within ministries. Submit one form per ministry. Anything optional can be left blank.',
    )
    .churchName()
    .heading2('Identity')
    .inputText('Ministry name', {
      required: true,
      placeholder: 'e.g., Kids, Youth, Adults, Small Groups',
    })
    .inputText('Ministry leader', {
      required: true,
      placeholder: 'Jane & John Smith',
      hint: 'Names as you would like them displayed.',
    })
    .multipleChoice('Is this person on staff or a volunteer?', ['Staff', 'Volunteer'])
    .pageBreak('Story')
    .heading2('Story')
    .inputText('Mission / tagline', {
      required: true,
      placeholder: 'One sentence',
      hint: 'One short line. Example: “Families fulfilling God’s purpose.”',
    })
    .textarea('Description', {
      required: true,
      placeholder: 'What the ministry is, who it is for, and what happens when someone joins.',
    })
    .pageBreak('Photos')
    .heading2('Photos and branding')
    .fileUpload('Ministry logo', {
      hint: 'Only if this ministry has its own logo, separate from the church logo.',
    })
    .fileUpload('Preview image', {
      required: true,
      hint: 'The image used on ministry cards and listings.',
    })
    .fileUpload('Banner image', {
      required: true,
      hint: 'Wide image for the top of the ministry page.',
    })
    .fileUpload('Gallery photos', {
      multiple: true,
      maxFiles: 10,
      hint: 'Up to 10 photos of the ministry in action.',
    })
    .pageBreak('Details')
    .heading2('Details')
    .textarea('FAQs', {
      placeholder: 'Q: What age range is this for?\nA: Kids ages 5–12.',
      hint: 'Common questions for this ministry. One Q/A pair per block.',
    })
    .textarea('Groups associated with this ministry', {
      placeholder: "Women's Connect\nMen's Breakfast",
      hint: 'One per line.',
    })
    .textarea('Events associated with this ministry', {
      placeholder: 'VBS — July 8–12\nFamily Night — first Friday each month',
      hint: 'One per line. Include a date if you have one.',
    })
    .textarea('Resources', {
      placeholder: 'Parent handbook — https://...',
      hint: 'Name and link, one per line.',
    })
    .inputLink('Facebook URL', {placeholder: 'https://facebook.com/...'})
    .inputLink('Instagram URL', {placeholder: 'https://instagram.com/...'})
  return b.build()
}

function buildCrewForm() {
  const b = new FormBuilder()
  b.formTitle(`${TITLE_PREFIX}Crew`, 'Submit team info')
    .intro('Help people discover how they can serve by sharing about your volunteer team.')
    .churchName()
    .heading2('Team overview')
    .inputText('Team name', {required: true, placeholder: 'e.g., First Impressions Team'})
    .inputText('Ministry / department', {
      required: true,
      placeholder: 'e.g., Guest Services',
      hint: 'Which ministry or department does this team belong to?',
    })
    .inputText('Tagline', {
      placeholder: 'e.g., Creating an unforgettable first experience',
    })
    .textarea('Team description', {
      required: true,
      placeholder: 'What does your team do? What is the impact? Why does it matter?',
    })
    .textarea('Why join this team?', {
      placeholder: 'What makes serving on this team special?',
      hint: 'Help potential volunteers see themselves on your team.',
    })
    .pageBreak('Roles & requirements')
    .heading2('Roles & requirements')
    .textarea('Roles / positions available', {
      required: true,
      placeholder: 'Greeter — Welcome guests at the door\nUsher — Help guests find seats',
      hint: 'One role per line.',
    })
    .inputText('Skills or experience needed', {
      placeholder: 'e.g., None required',
      hint: 'Leave blank if no special skills needed.',
    })
    .inputText('When do you serve?', {placeholder: 'e.g., Sundays 8AM–12PM'})
    .inputNumber('Minimum age', {
      placeholder: 'e.g., 16',
      hint: 'Leave blank if no age requirement.',
    })
    .dropdown(
      'Time commitment',
      [
        'Weekly (every week)',
        'Bi-weekly (every other week)',
        'Monthly (once a month)',
        'Flexible schedule',
        'Seasonal (events only)',
      ],
      {required: true},
    )
    .pageBreak('Team leader')
    .heading2('Team leader')
    .inputText('Leader name', {required: true, placeholder: 'Mike Johnson'})
    .inputEmail('Contact email', {placeholder: 'mike@church.com'})
    .inputLink('Sign-up link', {
      placeholder: 'https://...',
      hint: 'If you have a specific form or page for signing up.',
    })
    .pageBreak('Photos')
    .heading2('Photos')
    .fileUpload('Team photos', {
      multiple: true,
      maxFiles: 10,
      hint: '5–10 photos showing your team in action.',
    })
  return b.build()
}

function buildSmallGroupForm() {
  const b = new FormBuilder()
  b.formTitle(`${TITLE_PREFIX}Small Group`, 'Submit small group')
    .intro('Add your small group to our directory so new members can find and join you.')
    .churchName()
    .heading2('Group details')
    .inputText('Group name', {
      required: true,
      placeholder: "e.g., Smith's Home Group, Downtown Young Adults",
    })
    .dropdown(
      'Group type',
      [
        'Bible Study',
        'Community Group',
        'Life Group',
        'Connect Group',
        "Men's Group",
        "Women's Group",
        'Couples',
        'Recovery / Support',
        'Other',
      ],
      {required: true},
    )
    .inputText('Other group type', {
      placeholder: 'Please specify if you selected Other',
    })
    .dropdown(
      'Who is this group for?',
      [
        'Anyone',
        'Young Adults (18–30)',
        'Adults (30+)',
        'Men',
        'Women',
        'Married Couples',
        'Families with Kids',
        'Seniors (55+)',
        'College Students',
      ],
      {required: true},
    )
    .textarea('Group description', {
      required: true,
      placeholder: 'What happens at your group? What book are you studying? What is the vibe?',
    })
    .pageBreak('Meeting details')
    .heading2('Meeting details')
    .dropdown(
      'Meeting day',
      ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      {required: true},
    )
    .inputTime('Meeting time', {required: true})
    .dropdown('Duration', ['45 min', '1 hr', '1.5 hrs', '2 hrs', 'Varies'])
    .dropdown('Where do you meet?', ['At the church', 'Another location', 'Online only'], {
      required: true,
    })
    .inputText('Room / area', {
      placeholder: 'e.g., Room 201, Fellowship Hall',
      hint: 'If meeting at the church.',
    })
    .inputText('Address', {
      placeholder: '123 Main St, City, Province',
      hint: 'If meeting at another location.',
    })
    .inputLink('Meeting link', {
      placeholder: 'https://zoom.us/j/...',
      hint: 'If meeting online.',
    })
    .inputText('Campus', {placeholder: 'e.g., North Campus, Downtown Campus'})
    .textarea('Group options', {
      placeholder: 'Childcare available\nOpen to new members',
      hint: 'List any that apply, one per line.',
    })
    .pageBreak('Leaders')
    .heading2('Group leader(s)')
    .textarea('Leader name(s)', {
      required: true,
      placeholder: 'John & Jane Smith\nMike Johnson',
      hint: 'One leader per line. Couples can share one entry.',
    })
    .inputEmail('Contact email', {placeholder: 'john@email.com'})
    .inputLink('Sign-up link', {
      required: true,
      placeholder: 'https://churchcenter.com/...',
      hint: 'Where people can sign up.',
    })
    .pageBreak('Photos')
    .heading2('Group photos')
    .fileUpload('Photos', {
      multiple: true,
      maxFiles: 5,
      hint: 'Optional photos of your group, leaders, or a graphic.',
    })
  return b.build()
}

function buildEventForm() {
  const b = new FormBuilder()
  b.formTitle(`${TITLE_PREFIX}Event`, 'Submit event')
    .intro('Submit an upcoming event to be featured on the website calendar.')
    .churchName()
    .heading2('Event details')
    .inputText('Event name', {
      required: true,
      placeholder: "e.g., Women's Conference, Youth Night, Easter Service",
    })
    .inputText('Short summary', {
      required: true,
      placeholder: 'One sentence about the event',
      hint: 'Brief description for event listings (max ~150 characters).',
    })
    .textarea('Full description', {
      required: true,
      placeholder:
        'What is this event about?\nWho is it for?\nWhat will attendees experience?\nAny special guests or speakers?',
    })
    .inputText('Category', {
      placeholder: 'e.g., Conference, Service, Social, Training',
    })
    .dropdown('Who is hosting this event?', ['Church-wide', 'A specific ministry'], {
      required: true,
    })
    .inputText('Which ministry?', {
      placeholder: 'e.g., Youth, Women, Kids, Worship',
      hint: 'If hosted by a specific ministry.',
    })
    .pageBreak('Date & time')
    .heading2('Date & time')
    .inputDate('Start date', {required: true})
    .inputTime('Start time')
    .inputDate('End date', {hint: 'Leave blank for single-day events.'})
    .inputTime('End time')
    .textarea('Schedule notes', {
      placeholder: 'All day event\nRecurring weekly\nRecurring monthly',
      hint: 'Note if all-day or recurring, and how often.',
    })
    .inputText('Recurrence pattern', {
      placeholder: 'Weekly, Bi-weekly, Monthly, Quarterly, Annually',
    })
    .pageBreak('Location')
    .heading2('Location')
    .inputText('Location', {
      required: true,
      placeholder: 'e.g., Main Sanctuary, Fellowship Hall, Room 201, Off-site',
    })
    .textarea('Full address (if off-site)', {
      placeholder: '123 Main St, City, Province',
    })
    .pageBreak('Registration & cost')
    .heading2('Registration & cost')
    .inputLink('Registration link', {
      placeholder: 'https://churchcenter.com/...',
      hint: 'If registration is required.',
    })
    .inputText('Cost', {
      placeholder: 'e.g., Free, $10, $25 per person',
      hint: 'Leave blank if free.',
    })
    .pageBreak('Contact')
    .heading2('Contact')
    .inputText('Your name', {required: true, placeholder: 'Jane Smith'})
    .inputEmail('Your email', {
      required: true,
      placeholder: 'jane@church.com',
      hint: 'In case we have questions about this event.',
    })
    .pageBreak('Graphics')
    .heading2('Event graphics')
    .fileUpload('Promotional graphic', {
      hint: '1920×1080 (landscape) or 1080×1080 (square). PNG or JPG.',
    })
    .fileUpload('Photos from past events', {
      multiple: true,
      maxFiles: 5,
      hint: 'Optional but encouraged — up to 5 photos.',
    })
    .textarea('Additional information', {
      placeholder: 'Any other details we should know?',
    })
  return b.build()
}

function buildCourseForm() {
  const b = new FormBuilder()
  b.formTitle(`${TITLE_PREFIX}Course`, 'Submit course')
    .intro('Add your class, study, or course to the website so people can find and register.')
    .churchName()
    .heading2('Course details')
    .inputText('Course name', {
      required: true,
      placeholder: 'e.g., Financial Peace University, New Members Class',
    })
    .inputText('Tagline', {
      placeholder: 'A short description for listings (50–100 characters)',
    })
    .dropdown(
      'Course type',
      [
        'Bible Study',
        'Membership Class',
        'Financial Course',
        'Marriage / Parenting',
        'Leadership Development',
        'Recovery / Support',
        'New Believers',
        'Discipleship',
        'Other',
      ],
      {required: true},
    )
    .inputText('Other course type', {placeholder: 'Please specify if you selected Other'})
    .inputText('Duration', {
      required: true,
      placeholder: 'e.g., 6 weeks, One day, 9 sessions',
    })
    .textarea('Course description', {
      required: true,
      placeholder: 'What will participants learn? Who is this course for?',
    })
    .pageBreak('Schedule & location')
    .heading2('Schedule & location')
    .dropdown(
      'Meeting day',
      [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Multiple days',
        'Self-paced',
      ],
      {required: true},
    )
    .inputTime('Meeting time')
    .inputText('Session length', {placeholder: 'e.g., 90 minutes'})
    .inputDate('Next start date')
    .inputText('Location', {placeholder: 'e.g., Room 201, Fellowship Hall'})
    .inputText('Address', {
      placeholder: '123 Main St, City, Province',
      hint: 'Full address if meeting off-site.',
    })
    .inputText('Campus / area', {placeholder: 'e.g., North Campus, Downtown'})
    .textarea('Format notes', {
      placeholder: 'Available online\nChildcare available',
      hint: 'List any that apply, one per line.',
    })
    .pageBreak('Instructor & registration')
    .heading2('Instructor & registration')
    .inputText('Instructor name', {placeholder: 'Who teaches this course?'})
    .inputEmail('Contact email', {placeholder: 'instructor@church.com'})
    .inputText('Cost', {placeholder: 'e.g., Free, $25 for materials'})
    .inputNumber('Max participants', {
      placeholder: 'Leave blank for unlimited',
    })
    .textarea('Materials needed', {
      placeholder: 'e.g., Bible, workbook ($20, available at registration)',
    })
    .inputText('Prerequisites', {
      placeholder: 'e.g., Completed Membership Class',
      hint: 'Leave blank if open to everyone.',
    })
    .inputLink('Registration link', {placeholder: 'https://churchcenter.com/...'})
  return b.build()
}

function buildTestimonyForm() {
  const b = new FormBuilder()
  b.formTitle(`${TITLE_PREFIX}Testimony`, 'Submit testimony')
    .intro(
      'We would love to hear how God has been at work in your life. Your testimony could encourage someone else on their faith journey.',
    )
    .churchName()
    .heading2('About you')
    .inputText('Your name', {
      required: true,
      placeholder: 'Sarah J.',
      hint: 'First name only is fine if you prefer privacy.',
    })
    .inputText('How long have you been part of our church?', {
      placeholder: 'Since 2019 or 5 years',
    })
    .fileUpload('Your photo', {
      hint: 'Optional. Square crop preferred.',
    })
    .pageBreak('Your story')
    .heading2('Your story')
    .inputText('Story title', {
      required: true,
      placeholder: 'e.g., Finding Hope After Loss',
    })
    .textarea('Your full story', {
      required: true,
      placeholder: 'Share your story here...',
      hint: 'What was life like before? What happened? What is different now?',
    })
    .textarea('Key quote', {
      placeholder: 'One powerful sentence from your story.',
      hint: 'May be used in cards and previews (max ~200 characters).',
    })
    .inputText('Topics', {
      placeholder: 'e.g., healing, marriage, salvation, anxiety, addiction recovery',
      hint: 'Separate with commas.',
    })
    .pageBreak('Media')
    .heading2('Media (optional)')
    .multipleChoice('Do you have a video testimony?', ['No video', 'Yes, I have a video'])
    .inputLink('Video link', {
      placeholder: 'https://youtube.com/watch?v=...',
      hint: 'YouTube or Vimeo link, if applicable.',
    })
  return b.build()
}

const FAQ_CATEGORIES = [
  'General',
  'First-Time Visitors',
  'Kids Ministry',
  'Youth Ministry',
  'Giving & Finances',
  'Baptism',
  'Membership',
  'Volunteering',
  'Small Groups',
  'Events',
  'Other',
]

function buildFaqForm() {
  const b = new FormBuilder()
  b.formTitle('Church FAQs', 'Submit FAQs')
    .intro(
      'Pick one category, then write as many questions as you have for that topic. Need another category? Fill the form again.',
    )
    .churchName()
    .heading2('About you')
    .inputText('Your name', {required: true, placeholder: 'John Smith'})
    .inputText('Your role / ministry area', {
      placeholder: 'e.g., Guest Services, Kids Ministry, Worship Team',
      hint: 'Where do you serve? This helps us understand the context.',
    })
    .heading2('Questions for this category')
    .dropdown('Category', FAQ_CATEGORIES, {required: true})
    .inputText('Other category', {placeholder: 'If you selected Other'})
    .textarea('Questions and answers', {
      required: true,
      placeholder:
        'Q: What time does the service start?\nA: We start at 10am every Sunday.\n\nQ: Is there parking?\nA: Yes — the lot is behind the building.',
      hint: 'Use Q: for the question and A: for the answer. Leave a blank line between each pair.',
    })
  return b.build()
}

const KIT_FORM_IDS = {
  gettingStarted: 'XxPl4P',
  faq: 'obL6Gb',
}

const FORMS = [
  {
    key: 'gettingStarted',
    name: `${TITLE_PREFIX}Getting Started`,
    blocks: buildGettingStartedForm(),
  },
  {key: 'staff', name: `${TITLE_PREFIX}Staff Bio`, blocks: buildStaffBioForm()},
  {key: 'ministry', name: `${TITLE_PREFIX}Ministry`, blocks: buildMinistryForm()},
  {key: 'dreamTeam', name: `${TITLE_PREFIX}Crew`, blocks: buildCrewForm()},
  {key: 'smallGroup', name: `${TITLE_PREFIX}Small Group`, blocks: buildSmallGroupForm()},
  {key: 'event', name: `${TITLE_PREFIX}Event`, blocks: buildEventForm()},
  {key: 'course', name: `${TITLE_PREFIX}Course`, blocks: buildCourseForm()},
  {key: 'testimony', name: `${TITLE_PREFIX}Testimony`, blocks: buildTestimonyForm()},
  {key: 'faq', name: `${TITLE_PREFIX}FAQ`, blocks: buildFaqForm()},
]

async function tallyFetch(path, {method = 'GET', body} = {}) {
  const apiKey = getApiKey()
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'tally-version': TALLY_VERSION,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  if (!res.ok) {
    throw new Error(`${method} ${path} failed (${res.status}): ${JSON.stringify(data)}`)
  }
  return data
}

async function resolveFolderId() {
  try {
    const workspaces = await tallyFetch('/workspaces')
    const list = Array.isArray(workspaces) ? workspaces : workspaces.items || workspaces.workspaces
    const workspace = list?.[0]
    if (!workspace?.id) {
      console.log('No Tally workspace found — creating forms at the root.')
      return undefined
    }
    const folders = workspace.folders || (await tallyFetch(`/workspaces/${workspace.id}/folders`))
    const folderList = Array.isArray(folders) ? folders : folders.items || []
    const existing = folderList.find((folder) => folder.name === FOLDER_NAME)
    if (existing?.id) {
      console.log(`Using existing folder: ${FOLDER_NAME} (${existing.id})`)
      return existing.id
    }
    const created = await tallyFetch(`/workspaces/${workspace.id}/folders`, {
      method: 'POST',
      body: {name: FOLDER_NAME},
    })
    console.log(`Created folder: ${FOLDER_NAME} (${created.id})`)
    return created.id
  } catch (error) {
    console.log(`Folder step skipped (${error.message}). Creating forms at the root.`)
    return undefined
  }
}

async function listForms() {
  const existing = await tallyFetch('/forms?limit=100')
  return existing.items || []
}

async function createForms() {
  const folderId = await resolveFolderId()
  const existing = await listForms()
  const results = []

  for (const form of FORMS) {
    const duplicate = existing.find((item) => item.name === form.name)
    if (duplicate) {
      if (PROTECTED_TALLY_FORM_IDS.has(duplicate.id)) {
        throw new Error(
          `Refusing to reuse protected form ${duplicate.id} for ${form.name}. Rename collision.`,
        )
      }
      console.log(`Skip (already exists): ${form.name} → https://tally.so/r/${duplicate.id}`)
      results.push({
        key: form.key,
        id: duplicate.id,
        url: `https://tally.so/r/${duplicate.id}`,
        skipped: true,
      })
      continue
    }

    const body = {
      status: 'PUBLISHED',
      blocks: form.blocks,
    }
    if (folderId) body.folderId = folderId

    const created = await tallyFetch('/forms', {
      method: 'POST',
      body,
    })

    if (PROTECTED_TALLY_FORM_IDS.has(created.id)) {
      throw new Error(`Create returned protected form ID ${created.id}. Aborting.`)
    }

    const url = `https://tally.so/r/${created.id}`
    console.log(`Created: ${form.name} → ${url}`)
    existing.push({id: created.id, name: form.name})
    results.push({key: form.key, id: created.id, url, skipped: false})
  }

  return results
}

function parseRefreshKey() {
  const flag = process.argv.find((arg) => arg.startsWith('--refresh='))
  return flag ? flag.slice('--refresh='.length) : null
}

async function refreshForm(key) {
  const spec = FORMS.find((form) => form.key === key)
  const id = KIT_FORM_IDS[key]
  if (!spec || !id) {
    throw new Error(`Cannot refresh ${key}. Add it to FORMS and KIT_FORM_IDS.`)
  }
  if (PROTECTED_TALLY_FORM_IDS.has(id)) {
    throw new Error(`Refusing to PATCH protected form ${id}.`)
  }

  const current = await tallyFetch(`/forms/${id}`)
  if (PROTECTED_TALLY_FORM_IDS.has(current.id)) {
    throw new Error(`Refusing to PATCH protected form ${current.id}.`)
  }

  const updated = await tallyFetch(`/forms/${id}`, {
    method: 'PATCH',
    body: {
      name: current.name,
      status: 'PUBLISHED',
      blocks: spec.blocks,
    },
  })

  const url = `https://tally.so/r/${id}`
  console.log(`Refreshed: ${updated.name || spec.name} → ${url}`)
  return {key, id, url, skipped: false}
}

async function main() {
  const refreshKey = parseRefreshKey()
  const before = await listForms()
  for (const form of before) {
    if (PROTECTED_TALLY_FORM_IDS.has(form.id)) {
      console.log(`Protected (will not write): ${form.id} ${form.name}`)
    }
  }

  if (refreshKey) {
    await refreshForm(refreshKey)
    return
  }

  const results = await createForms()

  const after = await listForms()
  for (const id of PROTECTED_TALLY_FORM_IDS) {
    const beforeForm = before.find((item) => item.id === id)
    const afterForm = after.find((item) => item.id === id)
    if (!beforeForm || !afterForm) {
      throw new Error(`Protected form ${id} missing after create.`)
    }
    if (beforeForm.name !== afterForm.name) {
      throw new Error(`Protected form ${id} was renamed (${beforeForm.name} → ${afterForm.name}).`)
    }
  }

  console.log('\nCHURCH_TALLY_FORMS = {')
  for (const result of results) {
    console.log(`  ${result.key}: '${result.url}',`)
  }
  console.log('}')

  console.log('\nSummary:')
  for (const result of results) {
    console.log(`- ${result.key}: ${result.url}${result.skipped ? ' (existing)' : ''}`)
  }
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
