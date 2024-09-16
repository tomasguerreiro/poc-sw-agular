import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app/app.module";

if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker.register("/sw.js").then(
			(registration) => {
				console.log("ServiceWorker registration successful with scope: ", registration.scope);
			},
			(err) => {
				console.log("ServiceWorker registration failed: ", err);
			},
		);
	});
}

platformBrowserDynamic()
	.bootstrapModule(AppModule)
	.catch((err) => console.error(err));
