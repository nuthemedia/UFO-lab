import Link from "next/link";
import type { ClarkCaseRecord } from "@/data/clark/cases";
import { ClarkCaseExperience } from "./ClarkCaseExperience";
import { ClarkFooter } from "./ClarkFooter";
import styles from "./clark.module.css";

export function ClarkCasePage({ record, nextCase }: { record: ClarkCaseRecord; nextCase: ClarkCaseRecord }) {
  return (
    <div className={styles.caseRouteShell}>
      <nav className={styles.caseTopNav} aria-label="Clark case navigation">
        <Link href="/clark" className={styles.stageBackLink}>
          Clark トップへ
        </Link>
      </nav>
      <ClarkCaseExperience nextCase={nextCase} record={record} />
      <ClarkFooter />
    </div>
  );
}
