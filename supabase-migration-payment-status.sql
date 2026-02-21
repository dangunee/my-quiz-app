-- Update payment_status check constraint to allow 有/無 (replacing 未定/完了)
-- Run this in Supabase SQL Editor
-- 중요: 제약을 먼저 삭제한 후 UPDATE, 마지막에 새 제약 추가

-- 1. 기존 제약 삭제 (UPDATE가 가능하도록)
ALTER TABLE customer_profiles DROP CONSTRAINT IF EXISTS customer_profiles_payment_status_check;

-- 2. 기존 잘못된 값 정리
UPDATE customer_profiles SET payment_status = '無' WHERE payment_status = '未定';
UPDATE customer_profiles SET payment_status = '有' WHERE payment_status = '完了';
UPDATE customer_profiles SET payment_status = '無' WHERE payment_status = '無料';
UPDATE customer_profiles SET payment_status = '有' WHERE payment_status = '有料';

-- 3. 새 제약 추가
ALTER TABLE customer_profiles ADD CONSTRAINT customer_profiles_payment_status_check
  CHECK (payment_status IS NULL OR payment_status IN ('有', '無'));
