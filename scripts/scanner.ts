import cron from 'node-cron';
import { scanAllDue } from '../src/utils/scanner';

async function start() {
  console.log(new Date(), 'Initial scan due check...');
  await scanAllDue();

  // check every minute for due scans
  cron.schedule('* * * * *', () => {
    scanAllDue().catch(console.error);
  });
}

start().catch(console.error);
