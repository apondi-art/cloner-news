# clonernews

# description:

This project is a simple UI to interact with the HackerNews API, allowing users to stay updated on the latest posts, jobs, polls, and comments. The UI fetches data dynamically and updates live every 5 seconds with the newest information.

## Features:

- Posts: Displays stories, jobs, and polls in descending order (newest first).
- Comments: Each post includes its associated comments, loaded dynamically.
- Live Data: The app notifies users of new posts or updates every 5 seconds.
- Infinite Scrolling: Loads more posts when the user scrolls down, preventing the app from fetching all posts at once.


## Usage:

To run the Program, you'll need to have python3 installed on your system. After that, follow these steps:
1. Clone the Repository:
   ```sh
   git clone https://learn.zone01kisumu.ke/git/johnodhiambo0/clonernews.git
2. Navigate to the Project Directory:
   ```sh
   cd clonernews
   ```
   
3. Start the HTTP Server:

- For Python 3, run the following command:
  ```sh
  python3 -m http.server 3000
  ```

- For Python 2, use this command instead:
  ```sh
  python -m SimpleHTTPServer 3000
  ```

4. Access the Application: Open your web browser and go to:
        http://127.0.0.1:3000

5. Stop the Server: To stop the server, press CTRL + C in the terminal.

## Authors:

[STEPHEN OGINGA](https://learn.zone01kisumu.ke/git/steodhiambo)

[JOHN ODHIAMBO](https://learn.zone01kisumu.ke/git/johnodhiambo)

[QUINTER OCHIENG](https://learn.zone01kisumu.ke/git/quochieng)

## Licence:

This project is licensed under the [MIT](https://opensource.org/license/mit) License.

## Contributions:

Feel free to submit issues or pull requests to enhance the project. Follow the project's coding style and ensure the code is optimized for minimal API requests.
