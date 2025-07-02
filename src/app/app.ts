import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  title = 'Hello Frontend';
  message: string = '';
  tasks: { id: number; description: string; done: boolean }[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get('http://localhost:8080/api/hello', { responseType: 'text' })
      .subscribe((response) => {
        this.message = response;
      });

    this.http.get('http://localhost:8080/api/tasks', { responseType: 'json' })
      .subscribe((response: any) => {
        this.tasks = response;
      });
  }
}
