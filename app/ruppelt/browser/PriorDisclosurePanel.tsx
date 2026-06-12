"use client";

import {
  getPriorDisclosure,
  hasPriorDisclosureData,
  priorDisclosureConfidenceLabels,
  type PriorDisclosureAttributionSource,
  type PursueRecord,
} from "@/lib/pursue";

function getAttributionLabel(source: PriorDisclosureAttributionSource) {
  const labels: Record<PriorDisclosureAttributionSource, string> = {
    they_are_here: "they-are-here.com",
    ruppelt: "Ruppelt",
    nara: "NARA",
    fbi_vault: "FBI Vault",
    nasa: "NASA",
    aaro: "AARO",
    cia_crest: "CIA Reading Room / CREST",
    black_vault: "The Black Vault",
    internet_archive: "Internet Archive",
    wikimedia_commons: "Wikimedia Commons",
    dvids: "DVIDS",
    news: "報道",
    research_site: "研究者サイト",
  };

  return labels[source];
}

export function PriorDisclosurePanel({
  record,
  onClose,
}: {
  record: PursueRecord;
  onClose: () => void;
}) {
  const priorDisclosure = getPriorDisclosure(record);
  const disclosureLabel = hasPriorDisclosureData(record) ? priorDisclosure.labelJa : "未照合";
  const confidenceLabel = priorDisclosureConfidenceLabels[priorDisclosure.confidence];
  const visibleAttribution = priorDisclosure.attribution.filter((item) => item.visible !== "hidden");
  const evidenceNotes = Array.from(
    new Set([
      ...priorDisclosure.evidenceSummaryJa,
      ...priorDisclosure.evidence.map((item) => item.noteJa),
    ].filter(Boolean)),
  );
  const hasEvidence = evidenceNotes.length > 0;

  return (
    <div className="ruppelt-disclosure-layer" role="presentation" onClick={onClose}>
      <aside
        className="ruppelt-disclosure-panel"
        role="dialog"
        aria-modal="true"
        aria-label="公開状況の詳細"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ruppelt-disclosure-header">
          <div>
            <p className="ruppelt-disclosure-kicker">公開状況</p>
            <h2>{disclosureLabel}</h2>
          </div>
          <button type="button" aria-label="公開状況の詳細を閉じる" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="ruppelt-disclosure-status-row">
          <span>信頼度：{confidenceLabel}</span>
          {priorDisclosure.ruppeltVerified ? <span>Ruppelt確認済み</span> : null}
        </div>

        <section>
          <h3>判定材料</h3>
          {hasEvidence ? (
            <ul>
              {evidenceNotes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>公開状況を判断できる材料はまだ登録されていません。</p>
          )}
        </section>

        {priorDisclosure.evidence.some((item) => item.url) ? (
          <section>
            <h3>確認リンク</h3>
            <div className="ruppelt-disclosure-links">
              {priorDisclosure.evidence
                .filter((item) => item.url)
                .map((item) => (
                  <a key={`${item.label}-${item.url}`} href={item.url} target="_blank" rel="noreferrer">
                    {item.label}
                  </a>
                ))}
            </div>
          </section>
        ) : null}

        {priorDisclosure.reviewerNoteJa ? (
          <section>
            <h3>補足メモ</h3>
            <p>{priorDisclosure.reviewerNoteJa}</p>
          </section>
        ) : null}

        {visibleAttribution.length > 0 ? (
          <p className="ruppelt-disclosure-reference">
            参考照合元：
            {visibleAttribution.map((item, indexValue) => (
              <span key={`${item.source}-${item.sourceUrl || indexValue}`}>
                {indexValue > 0 ? "、" : ""}
                {item.sourceUrl ? (
                  <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                    {getAttributionLabel(item.source)}
                  </a>
                ) : (
                  getAttributionLabel(item.source)
                )}
              </span>
            ))}
          </p>
        ) : null}
      </aside>
    </div>
  );
}
