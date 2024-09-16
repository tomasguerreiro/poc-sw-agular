import { Component } from "@angular/core";

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"],
})
export class AppComponent {
	title = "angular-sw-poc";

	url = "https://jsonplaceholder.typicode.com/posts";

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	posts: any[] = [];

	ngOnInit() {
		this.getPosts();
	}

	async getPosts() {
		const response = await fetch(this.url);
		this.posts = await response.json();
	}
}
