# Technical Assessment | Mid Full Stack

## Starter Project

https://github.com/blurrso/tech-assessment  
Clone the repository to your GitHub.

## Tech Stack

- **Frontend:** React + Tailwind + shadcn + Prisma
- **Backend:** NextJS server actions, no separate backend service or API needed
- **Database:** SQLite
- **Authentication:** NextAuth.js

## Delivery Format

- GitHub repo + video demo for the dashboard (1-3 mins)
- Keep the database file committed to the source code
- Deploy it to Vercel free plan and share the link

## Objective

Carefully read the following user story and build a production-ready React application that implements the specified functionality.

Your task involves creating a robust frontend solution for the **Blurr HR Portal**, enabling users to efficiently manage their employees and their projects.

## General Rules

- You are expected to heavily use AI in the process, use CursorAI, WindsurfAI or any other agentic AI tools to help you with the task
- Use AI for Everything, you will be judged on your skills to produce the best code with AI, to navigate and guide the AI to generate structured high quality meaningful production ready code
- We believe AI is the Future, and the skill to harness its power is crucial to success

## Context

At Blurr, we provide systems to help companies automate their workflow and increase their value. We consider ourselves to be the success partners for our customers to help them overcome their pain points and eliminate pipeline bottlenecks.

## User Story

As a user of Blurr HR Portal, I want to efficiently manage my employees, calculate their salaries and track projects and tasks.

## Acceptance Criteria

### Authentication

- Users can login/signup to the portal

### Portal Structure

Portal has two main sections:

#### Employees Section

- Users can add and manage employees within their organization
- Each employee has fields for basic employee information: Employee ID, Name, Joining Date, Basic Salary
- A salary table displays a list of employees and their corresponding salary details
- User can pick a month to generate the salary table
- User can add bonus and deductible to each employee in the salary table, to be automatically calculated in their payable amount

#### Project Section

- User can add and manage projects
- User can add tasks to the projects
- Tasks will have needed fields: Title, Description, Priority, Assigned To, Status
- User can assign employee to the task
- Kanban board to display the tasks by their status
- Backlog table to display all the tasks

### Additional Extra Task

- Create an AI chatbot the user can ask to get information about their tasks and projects

## Additional Notes and Remarks

- Use AI to chat and discuss how to put the best architecture for this project, and how to approach this task
- Plan carefully, Ask AI to detail each task, and explore technical implementation for each, adjust technical implementations as you see fit
- Save the details for each task as MD file in the AI directory, you can use this each time you prompt the AI to work on a feature. Keep those in the git, we would like to assess them, see how you think and how you have successfully managed to put the best plan and architecture for the project
- We are interested in seeing how you come up with solutions for the problems, how you will solve them, think about them, how you search them and divide large ambiguous tasks into digestible easy to implement technical format
