-- ============================================
-- Add missing columns to transactions table
-- ============================================

-- Add columns if they don't exist (using DO block for conditional logic)
DO $$ 
BEGIN
    -- Add company_id if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transactions' AND column_name = 'company_id') THEN
        ALTER TABLE public.transactions ADD COLUMN company_id UUID;
    END IF;

    -- Add source if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transactions' AND column_name = 'source') THEN
        ALTER TABLE public.transactions ADD COLUMN source TEXT DEFAULT 'manual';
    END IF;

    -- Add external_id if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transactions' AND column_name = 'external_id') THEN
        ALTER TABLE public.transactions ADD COLUMN external_id TEXT;
    END IF;

    -- Add AI suggestion columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transactions' AND column_name = 'ai_category') THEN
        ALTER TABLE public.transactions ADD COLUMN ai_category TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transactions' AND column_name = 'ai_account') THEN
        ALTER TABLE public.transactions ADD COLUMN ai_account TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transactions' AND column_name = 'ai_confidence') THEN
        ALTER TABLE public.transactions ADD COLUMN ai_confidence INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transactions' AND column_name = 'ai_reasoning') THEN
        ALTER TABLE public.transactions ADD COLUMN ai_reasoning TEXT;
    END IF;

    -- Add booking columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transactions' AND column_name = 'voucher_id') THEN
        ALTER TABLE public.transactions ADD COLUMN voucher_id TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transactions' AND column_name = 'booked_at') THEN
        ALTER TABLE public.transactions ADD COLUMN booked_at TIMESTAMPTZ;
    END IF;

    -- Add receipt linking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transactions' AND column_name = 'receipt_id') THEN
        ALTER TABLE public.transactions ADD COLUMN receipt_id TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transactions' AND column_name = 'attachments') THEN
        ALTER TABLE public.transactions ADD COLUMN attachments TEXT[];
    END IF;

    -- Add icon columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transactions' AND column_name = 'icon_name') THEN
        ALTER TABLE public.transactions ADD COLUMN icon_name TEXT DEFAULT 'CreditCard';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transactions' AND column_name = 'icon_color') THEN
        ALTER TABLE public.transactions ADD COLUMN icon_color TEXT DEFAULT 'text-gray-500';
    END IF;

    -- Add currency if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transactions' AND column_name = 'currency') THEN
        ALTER TABLE public.transactions ADD COLUMN currency TEXT DEFAULT 'SEK';
    END IF;

    -- Add amount_value for numeric calculations
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transactions' AND column_name = 'amount_value') THEN
        ALTER TABLE public.transactions ADD COLUMN amount_value DECIMAL(12, 2);
    END IF;

END $$;

-- Create indexes (IF NOT EXISTS handles duplicates)
CREATE INDEX IF NOT EXISTS idx_transactions_company_id ON public.transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_source ON public.transactions(source);
CREATE INDEX IF NOT EXISTS idx_transactions_external_id ON public.transactions(external_id);

-- Grant permissions
GRANT ALL ON public.transactions TO anon;
