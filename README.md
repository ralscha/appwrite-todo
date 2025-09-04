# Todo Application with Appwrite Backend

A complete Angular/Ionic todo application using Appwrite as the backend service.

## Step 1: Create Appwrite Account and Project

### 1.1 Sign up for Appwrite Cloud
1. Go to [https://cloud.appwrite.io](https://cloud.appwrite.io)
2. Click **Sign up** and create your account

Appwrite offers a free tier that is sufficient for this example application.

### 1.2 Create a New Project
1. In your Appwrite Console, click **Create Project**
2. Enter project details:
   - **Name**: `todo` (or your preferred name)
   - **Project ID**: This will be auto-generated (e.g., `668b2b9730029ec3ac337`)
   - **Region**: Choose the region where the backend will be hosted (e.g., `Frankfurt`)
3. Click **Create**

### 1.3 Note Your Project Configuration
After creating the project, note down:
- **Project ID**: Found in Project Settings
- **API Endpoint**: Your region endpoint (e.g., `https://fra.cloud.appwrite.io/v1`)
- **Project Name**: The name you gave your project

## Step 2: Configure Web Platform

### 2.1 Add Web Platform
1. In your Appwrite Console, go to **Overview**
2. Click **Add Platform**
3. Select **Web**
4. Select **Type** Angular
5. Enter **Hostname** `localhost` (for development)
6. Click **Create platform**

## Step 3: Set Up Authentication

### 3.1 Configure Authentication Method
1. Navigate to **Auth** in the left sidebar
2. Go to **Settings**
3. In **Auth methods** section, ensure **Email/Password** is enabled and all other options are disabled

### 3.2 Configure Security
1. Go to **Auth** → **Security**
2. Check all options and set them according to your security needs
3. Click **Update** whenever you make changes

## Step 4: Create Database and Tables

### 4.1 Create Database
1. Navigate to **Databases** in the left sidebar
2. Click **Create Database**
3. Enter details:
   - **Name**: `Todos Database`
   - **Database ID**: Enter one or omit to be auto-generated (e.g., `todos-database`)
4. Click **Create**

### 4.2 Create Todos Table
1. Inside your new database, click **Create table**
2. Enter table details:
   - **Name**: `Todos`
   - **Table ID**: Enter one or omit to be auto-generated (e.g., `todos`)
3. Click **Create**

### 4.3 Create Table Columns
In the `todos` table, go to **Columns** and create these columns:

#### 4.4.1 Title Column
- Click **Create Column**
- **Key**: `title`
- **Type**: String
- **Size**: 255
- **Required**: ✅
- Click **Create**

#### 4.4.2 Description Column
- Click **Create Column**
- **Key**: `description`
- **Type**: String
- **Size**: 1000
- **Required**: ❌
- Click **Create**

#### 4.4.3 Completed Column
- Click **Create Column**
- **Key**: `completed`
- **Type**: Boolean
- **Required**: ✅
- **Default**: `false`
- Click **Create**

#### 4.4.4 Due Date Column
- Click **Create Column**
- **Key**: `dueDate`
- **Type**: DateTime
- **Required**: ❌
- Click **Create**

Appwrite automatically adds the $id (primary key), $createdAt, and $updatedAt columns.

### 4.5 Set Table Permissions
1. Go to the **Settings** tab of the `todos` table
2. Under **Permissions**, add one role:
   - Role **All users**
   - Enable **Create** only. Other permissions must be disabled.
4. Click **Update**
3. Under **Row Security**, enable **Row security** to allow row-level permissions.
4. Click **Update**

## Step 5: Configure Application Environment

### 5.1 Update Development Environment
1. Open `src/environments/environment.ts`
2. Replace the configuration with your project details:

```typescript
export const environment: {
  appwriteEndpoint: string;
  appwriteProjectId: string;
  appwriteProjectName: string;
  production: boolean;
} = {
  appwriteEndpoint: 'YOUR_API_ENDPOINT', // e.g., 'https://fra.cloud.appwrite.io/v1'
  appwriteProjectId: 'YOUR_PROJECT_ID', // e.g., '668b2b9730029ec3ac337'
  appwriteProjectName: 'YOUR_PROJECT_NAME', // e.g., 'todo'
  production: false
};
```

Update `src/environments/environment.prod.ts` similarly for production settings.


## Step 6: Install and Run the Application

### 6.1 Install Dependencies
```bash
npm install
```

### 6.2 Start Development Server
```bash
ionic serve -o
```
The application will be open in the browser at `http://localhost:8100`


## Licenses
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.