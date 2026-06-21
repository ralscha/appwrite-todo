# Appwrite Todo

An Angular/Ionic todo app that uses Appwrite Cloud for email/password authentication, password recovery, and per-user todo storage with Appwrite TablesDB.

Demo: [https://appwrite-todo.appwrite.network/](https://appwrite-todo.appwrite.network/)

## Tech Stack

- Angular 22 standalone application
- Ionic Angular 8
- Appwrite Web SDK 26 with `TablesDB`
- TypeScript strict mode and Angular ESLint

## Appwrite Setup

### 1. Create a Project

1. Sign in at [https://cloud.appwrite.io](https://cloud.appwrite.io).
2. Create a new project.
3. Note the project endpoint and project ID.

The checked-in environment files currently point to:

```ts
appwriteEndpoint: 'https://fra.cloud.appwrite.io/v1';
appwriteProjectId: '68b2b9730029ec3ac337';
appwriteProjectName: 'todo';
```

Update `src/environments/environment.ts` and `src/environments/environment.prod.ts` if you use a different Appwrite project.

### 2. Add Web Platforms

In the Appwrite Console, add a Web platform for every host that will run the app:

- `localhost` for local development
- your production hostname for deployed builds

Password recovery redirects back to `/password-reset`, so the host used for the reset email must be registered as an allowed platform host.

### 3. Enable Authentication

In **Auth > Settings**, enable **Email/Password** authentication. The app uses these account APIs:

- register
- login/logout
- update name/email
- password recovery

### 4. Create the Database and Table

The app uses fixed IDs in `src/app/services/appwrite.service.ts`:

- Database ID: `todos-database`
- Table ID: `todos`

Create a database and table with those IDs, or update the service constants if you choose different IDs.

Create these table columns:

| Key           | Type     | Required | Notes             |
| ------------- | -------- | -------- | ----------------- |
| `title`       | String   | Yes      | Size 255          |
| `description` | String   | No       | Size 1000         |
| `completed`   | Boolean  | Yes      | Default `false`   |
| `dueDate`     | DateTime | No       | Can be empty/null |

Appwrite provides `$id`, `$createdAt`, and `$updatedAt` automatically.

### 5. Configure Permissions

On the `todos` table:

1. Enable row security.
2. Grant **All users** the **Create** permission only.

The client adds read, update, and delete permissions to each created row for the signed-in user.

## Local Development

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm start
```

Angular serves the app at `http://localhost:4200` by default.

## Project Scripts

```bash
npm start      # Run the Angular dev server
npm run build  # Create a production build in dist/app
npm run lint   # Run Angular ESLint
npm run format # Format the workspace with Prettier
```

## Notes

- The Appwrite SDK currently pulls in `json-bigint`, which Angular reports as a CommonJS optimization warning during production builds.
- `npm audit --omit=dev` reports no production vulnerabilities. Any remaining audit findings are in development tooling.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
