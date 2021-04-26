import { Analytics } from './analytics';
import { Configuration } from './bridge';
export declare const configure: (writeKey: string, { flushAt, debug, recordScreenViews, trackAppLifecycleEvents, using, defaultProjectSettings, proxy, ios, android }: Analytics.Configuration) => Promise<Configuration>;
