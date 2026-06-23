import styles from "./clark.module.css";

const sightingWave = [
  {
    label: "1947",
    total: 122,
    unidentified: 12,
    note: "Arnold / Sign",
  },
  {
    label: "1948",
    total: 156,
    unidentified: 7,
    note: "Project Sign",
  },
  {
    label: "1949",
    total: 186,
    unidentified: 22,
    note: "Grudge begins",
  },
  {
    label: "1950",
    total: 210,
    unidentified: 27,
    note: "reports mount",
  },
  {
    label: "1951",
    total: 169,
    unidentified: 22,
    note: "pre-Blue Book",
  },
  {
    label: "1952",
    total: 1501,
    unidentified: 303,
    note: "Blue Book wave",
  },
];

export function ClarkSightingWaveChart({ showDescription = true }: { showDescription?: boolean }) {
  const maxValue = Math.max(...sightingWave.map((item) => item.total));
  const chartWidth = 720;
  const chartHeight = 320;
  const baseline = 236;
  const barWidth = 54;
  const step = 104;
  const linePoints = sightingWave
    .map((item, index) => {
      const x = 62 + index * step + barWidth / 2;
      const height = Math.max(18, (item.total / maxValue) * 174);
      return `${x},${baseline - height}`;
    })
    .join(" ");

  return (
    <div className={styles.sightingWaveChart}>
      <div className={styles.sightingWaveHeader}>
        <span>Air Force sighting totals</span>
        <strong>1947年から1952年へ、報告数は大きな波になる</strong>
      </div>
      <svg
        aria-label="ケネス・アーノルド事件以後の目撃報告増加を示す年代付き展示チャート"
        className={styles.sightingWaveSvg}
        role="img"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      >
        <line x1="42" x2="678" y1={baseline} y2={baseline} />
        <polyline points={linePoints} />
        {sightingWave.map((item, index) => {
          const x = 62 + index * step;
          const height = Math.max(18, (item.total / maxValue) * 174);
          const y = baseline - height;
          const unidentifiedY = baseline - Math.max(10, (item.unidentified / maxValue) * 174);

          return (
            <g key={item.label}>
              <rect height={height} rx="8" width={barWidth} x={x} y={y} />
              <circle cx={x + barWidth / 2} cy={y} r="8" />
              <circle className={styles.sightingWaveUnknown} cx={x + barWidth / 2} cy={unidentifiedY} r="5" />
              <text className={styles.sightingWaveValue} x={x + barWidth / 2} y={y - 18}>
                {item.total.toLocaleString("en-US")}
              </text>
              <text className={styles.sightingWaveLabel} x={x + barWidth / 2} y={baseline + 34}>
                {item.label}
              </text>
              <text className={styles.sightingWaveNote} x={x + barWidth / 2} y={baseline + 57}>
                {item.note}
              </text>
            </g>
          );
        })}
      </svg>
      {showDescription ? (
        <p>
          データは米空軍の UFO Fact Sheet にある `TOTAL UFO SIGHTINGS, 1947-1969` から、アーノルド事件後の初期6年を抜粋したもの。棒は各年の総報告数、白い小点は同表の `UNIDENTIFIED` 数を示す。1952年は Project Blue Book の開始、Washington D.C. UFO事件、新聞報道の集中、空軍への報告集中が重なった年であり、このグラフは現象そのものの発生数ではなく、米空軍に記録された報告数の波を読むための資料である。
          <br />
          Source:{" "}
          <a href="https://www.esd.whs.mil/Portals/54/Documents/FOID/Reading%20Room/UFOsandUAPs/2d_af_1.pdf" rel="noreferrer" target="_blank">
            U.S. Air Force UFO Fact Sheet
          </a>
          {" / "}
          <a href="https://www.archives.gov/news/articles/project-blue-book-50th-anniversary" rel="noreferrer" target="_blank">
            National Archives
          </a>
        </p>
      ) : null}
    </div>
  );
}
