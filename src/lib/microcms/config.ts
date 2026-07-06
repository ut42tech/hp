/** ISR の再生成間隔（秒）。1時間。 */
export const MICROCMS_REVALIDATE_SECONDS = 3600;

export interface MicroCMSConfig {
  serviceDomain: string;
  apiKey: string;
}

/**
 * microCMS の接続設定を env から読む。
 * 本サイトは microCMS を単一ソースとするため、未設定はフォールバックせず即 throw する
 * （ビルドを明確なメッセージで失敗させる）。
 */
export function getMicroCMSConfig(): MicroCMSConfig {
  const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
  const apiKey = process.env.MICROCMS_API_KEY;
  if (!serviceDomain || !apiKey) {
    throw new Error(
      "MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY が未設定です。" +
        "ローカルは .env.local、本番は Vercel の環境変数に設定してください（.env.example 参照）。",
    );
  }
  return { serviceDomain, apiKey };
}
