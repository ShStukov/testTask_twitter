import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserService } from '../../data/services/user.service';
import { User } from '../../data/models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    RouterModule
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  loading: boolean = true;

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.getUsers();
  }

  getUsers() {
    this.loading = true;

    this.userService.getUsers().subscribe(data => {
      console.log(data);
      this.users = data;
      this.loading = false;
    });
  }
}
