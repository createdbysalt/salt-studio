-- Signed statement of work, stored the same way as the MSA PDF.
-- Additive and nullable. Rows written before this column existed stay null,
-- and the email rebuilds the PDF from agreed_document.sow.blocks.

alter table public.proposal_acceptances
  add column if not exists sow_pdf_bytes_base64 text,
  add column if not exists sow_pdf_sha256 text;

comment on column public.proposal_acceptances.sow_pdf_bytes_base64 is
  'Base64 bytes of the signed statement of work PDF at the moment of signing. Null on rows written before this column existed.';
comment on column public.proposal_acceptances.sow_pdf_sha256 is
  'SHA-256 of sow_pdf_bytes_base64. Null when the PDF was not stored.';
