-- Microsoft Entra ID — link portal users to Azure AD object ID
ALTER TABLE users ADD COLUMN IF NOT EXISTS azure_oid VARCHAR(128) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_users_azure_oid ON users(azure_oid) WHERE azure_oid IS NOT NULL;
