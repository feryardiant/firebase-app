# Sendgrid Inbound Parser

My personal implementation of SendGrid inbound-mail parser.

## Usage

This package exposes 4 functions

### `async parseEmail(req): Promise<NormalizedEmail>`
Parse email field in inbound mail body.

### `async storeAttachment(attachment, bucket): Promise<File>`
Store the attachment file to google storage bucket.

### `normalize(email): NormalizedEmail`
Normalize parsed-mail from 'mailparser' package

### `inboundParser()`
Express middleware to parse request body.

---
Please refer to [this file](dist/index.d.ts) for more type definitions

## Credits

- Official inbound-mail parser [@sendgrid/inbound-mail-parser](https://www.npmjs.com/package/@sendgrid/inbound-mail-parser)

## Licenses
code is licensed under [MIT](./LICENSE),
