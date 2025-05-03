import ExplorerClient from './explorer-client';
import styles from './page.module.css'

export const dynamic = 'force-dynamic';

export default function ExplorerPage() {
  return (
    <div className={styles.container}>
      <ExplorerClient />;
    </div>
  )
}
