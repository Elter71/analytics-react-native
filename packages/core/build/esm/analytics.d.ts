import { JsonMap, Options } from './bridge';
import { Middleware } from './middleware';
import { ErrorHandler } from './wrapper';
export declare module Analytics {
    type Integration = (() => PromiseLike<void>) | {
        disabled: true;
    };
    interface Configuration {
        /**
         * Whether the analytics client should automatically make a screen call when a
         * view controller is added to a view hierarchy.
         * Because the iOS underlying implementation uses method swizzling,
         * we recommend initializing the analytics client as early as possible.
         *
         * Disabled by default.
         */
        recordScreenViews?: boolean;
        /**
         * Whether the analytics client should automatically track application lifecycle events, such as
         * "Application Installed", "Application Updated" and "Application Opened".
         *
         * Disabled by default.
         */
        trackAppLifecycleEvents?: boolean;
        /**
         * @deprecated The property should not be used
         */
        trackAttributionData?: boolean;
        /**
         * Register a set of integrations to be used with this Analytics instance.
         */
        using?: Integration[];
        debug?: boolean;
        /**
         * Default project settings to use, if Segment.com cannot be reached. An example
         * configuration can be found here, using your write key: <a
         * href="https://cdn-settings.segment.com/v1/projects/YOUR_WRITE_KEY/settings">
         * https://cdn-settings.segment.com/v1/projects/YOUR_WRITE_KEY/settings </a>
         */
        defaultProjectSettings?: {
            [key: string]: any;
        };
        /**
         * The number of queued events that the analytics client should flush at.
         * Setting this to `1` will not queue any events and will use more battery.
         *
         * `20` by default.
         */
        flushAt?: number;
        /**
         * Whether the analytics client should send all requests through your own hosted
         * proxy rather than directly to Segment.
         * See:
         *  iOS: https://segment.com/docs/connections/sources/catalog/libraries/mobile/ios/#proxy-http-calls
         *  android: https://segment.com/docs/connections/sources/catalog/libraries/mobile/android/#proxy-http-calls
         *
         * Ex. For a desired proxy through `http://localhost:64000/segment` the configuration would look like such
         * {
         * 	scheme: 'http',
         * 	host: 'localhost',
         * 	port: 64000,
         *  path: '/segment'
         * }
         *
         */
        proxy?: {
            /**
             * The proxy scheme, ex: http, https
             *
             * `https` by default.
             */
            scheme?: string;
            /**
             * The proxy host name, ex: api.segment.io, cdn.segment.io
             *
             * Note: When using localhost with an Android device or simulator use `adb reverse tcp:<port> tcp:<port>`
             */
            host?: string;
            /**
             * The proxy port number, ex: 80
             */
            port?: number;
            /**
             * The proxy path, ex: /path/to/proxy
             */
            path?: string;
        };
        /**
         * iOS specific settings.
         */
        ios?: {
            /**
             * Whether the analytics client should track advertisting info.
             *
             * Enabled by default.
             */
            trackAdvertising?: boolean;
            /**
             * Whether the analytics client should automatically track deep links.
             * You'll still need to call the continueUserActivity and openURL methods on the native analytics client.
             *
             * Disabled by default.
             */
            trackDeepLinks?: boolean;
        };
        /**
         * Android specific settings.
         */
        android?: {
            /**
             * Set the interval in milliseconds at which the client should flush events. The client will automatically flush
             * events to Segment every {@link flushInterval} duration, regardless of {@link flushAt}.
             */
            flushInterval?: number;
            /**
             * Whether the analytics client should client the device identifier.
             * The device identifier is obtained using :
             * - `android.provider.Settings.Secure.ANDROID_ID`
             * - `android.os.Build.SERIAL`
             * - or Telephony Identifier retrieved via TelephonyManager as available
             *
             * Enabled by default.
             */
            collectDeviceId?: boolean;
            /**
             * Whether the analytics client should use the new lifecycle methods. This option is enabled by default.
             * If the new lifecycle methods cause issue, you should disable this config option
             */
            experimentalUseNewLifecycleMethods?: boolean;
        };
    }
    class Client {
        /**
         * Whether the client is ready to send events to Segment.
         *
         * This becomes `true` when `.setup()` succeeds.
         * All calls will be queued until it becomes `true`.
         */
        readonly ready = false;
        private readonly wrapper;
        private readonly handlers;
        private readonly middlewares;
        /**
         * Catch React-Native bridge errors
         *
         * These errors are emitted when calling the native counterpart.
         * This only applies to methods with no return value (`Promise<void>`),
         * methods like `getAnonymousId` do reject promises.
         */
        catch(handler: ErrorHandler): this;
        /**
         * Sets the IDFA value on iOS.  Customers are now responsible for collecting
         * IDFA on their own.
         */
        setIDFA(idfa: string): void;
        /**
         * Append a new middleware to the middleware chain.
         *
         * Middlewares are a powerful mechanism that can augment the events collected by the SDK.
         * A middleware is a simple function that is invoked by the Segment SDK and can be used to monitor,
         * modify or reject events.
         *
         * Middlewares are invoked for all events, including automatically tracked events,
         * and external event sources like Adjust and Optimizely.
         * This offers you the ability the customize those messages to fit your use case even
         * if the event was sent outside your source code.
         *
         * The key thing to observe here is that the output produced by the first middleware feeds into the second.
         * This allows you to chain and compose independent middlewares!
         *
         * For example, you might want to record the device year class with your events.
         * Previously, you would have to do this everywhere you trigger an event with the Segment SDK.
         * With middlewares, you can do this in a single place :
         *
         * ```js
         * import DeviceYearClass from 'react-native-device-year-class'
         *
         * analytics.middleware(async ({next, context}) =>
         *   next({
         *     ...context,
         *     device_year_class: await DeviceYearClass()
         *   })
         * )
         * ```
         *
         * @param middleware
         */
        middleware(middleware: Middleware): this;
        /**
         * Use the native configuration.
         *
         * You'll need to call this method when you configure Analytics's singleton
         * using the native API.
         */
        useNativeConfiguration(): this;
        /**
         * Setup the Analytics module. All calls made before are queued
         * and only executed if the configuration was successful.
         *
         * ```js
         * await analytics.setup('YOUR_WRITE_KEY', {
         *   using: [Mixpanel, GoogleAnalytics],
         *   trackAppLifecycleEvents: true,
         *   ios: {
         *     trackDeepLinks: true
         *   }
         * })
         * ```
         *
         * @param writeKey Your Segment.io write key
         * @param configuration An optional {@link Configuration} object.
         */
        setup(writeKey: string, configuration?: Configuration): Promise<void>;
        /**
         * Record the actions your users perform.
         *
         * When a user performs an action in your app, you'll want to track that action for later analysis.
         * Use the event name to say what the user did, and properties to specify any interesting details of the action.
         *
         * @param event The name of the event you're tracking.
         * We recommend using human-readable names like `Played a Song` or `Updated Status`.
         * @param properties A dictionary of properties for the event.
         * If the event was 'Added to Shopping Cart', it might have properties like price, productType, etc.
         * @param options A dictionary of options, e.g. integrations (thigh analytics integration to forward the event to)
         */
        track(event: string, properties?: JsonMap, options?: Options): Promise<void>;
        /**
         * Record the screens or views your users see.
         *
         * When a user views a screen in your app, you'll want to record that here.
         * For some tools like Google Analytics and Flurry, screen views are treated specially, and are different
         * from "events" kind of like "page views" on the web. For services that don't treat "screen views" specially,
         * we map "screen" straight to "track" with the same parameters. For example, Mixpanel doesn't treat "screen views" any differently.
         * So a call to "screen" will be tracked as a normal event in Mixpanel, but get sent to Google Analytics and Flurry as a "screen".
         *
         * @param name The title of the screen being viewed.
         * We recommend using human-readable names like 'Photo Feed' or 'Completed Purchase Screen'.
         * @param properties A dictionary of properties for the screen view event.
         * If the event was 'Added to Shopping Cart', it might have properties like price, productType, etc.
         */
        screen(name: string, properties?: JsonMap, options?: Options): Promise<void>;
        /**
         * Associate a user with their unique ID and record traits about them.
         *
         * When you learn more about who your user is, you can record that information with identify.
         *
         * @param user database ID (or email address) for this user.
         * If you don't have a userId but want to record traits, you should pass nil.
         * For more information on how we generate the UUID and Apple's policies on IDs, see https://segment.io/libraries/ios#ids
         * @param traits A dictionary of traits you know about the user. Things like: email, name, plan, etc.
         * @param options A dictionary of options, e.g. integrations (thigh analytics integration to forward the event to)
         */
        identify(user: string | null, traits?: JsonMap, options?: Options): Promise<void>;
        /**
         * Associate a user with a group, organization, company, project, or w/e *you* call them.
         *
         * When you learn more about who the group is, you can record that information with group.
         *
         * @param groupId A database ID for this group.
         * @param traits A dictionary of traits you know about the group. Things like: name, employees, etc.
         * @param options A dictionary of options, e.g. integrations (thigh analytics integration to forward the event to)
         */
        group(groupId: string, traits?: JsonMap, options?: Options): Promise<void>;
        /**
         * Merge two user identities, effectively connecting two sets of user data as one.
         * This may not be supported by all integrations.
         *
         * When you learn more about who the group is, you can record that information with group.
         *
         * @param newId The new ID you want to alias the existing ID to.
         * The existing ID will be either the previousId if you have called identify, or the anonymous ID.
         */
        alias(newId: string, options?: Options): Promise<void>;
        /**
         * Reset any user state that is cached on the device.
         *
         * This is useful when a user logs out and you want to clear the identity.
         * It will clear any traits or userId's cached on the device.
         */
        reset(): Promise<void>;
        /**
         * Trigger an upload of all queued events.
         *
         * This is useful when you want to force all messages queued on the device to be uploaded.
         * Please note that not all integrations respond to this method.
         */
        flush(): Promise<void>;
        /**
         * Enable the sending of analytics data. Enabled by default.
         *
         * Occasionally used in conjunction with disable user opt-out handling.
         */
        enable(): Promise<void>;
        /**
         * Completely disable the sending of any analytics data.
         *
         * If you have a way for users to actively or passively (sometimes based on location) opt-out of
         * analytics data collection, you can use this method to turn off all data collection.
         */
        disable(): Promise<void>;
        /** Retrieve the anonymousId. */
        getAnonymousId(): Promise<string>;
        private handleError;
    }
}
