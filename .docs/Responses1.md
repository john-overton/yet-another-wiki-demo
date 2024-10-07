
# Areas Requiring Clarification or Alignment

1. **Billing Structure**

- The "Idea.md" document mentions billing broken down by total users and usage by organizational unit.

- The "OrgSetup.md" document suggests that sub-companies could have separate billing.

- The current data model doesn't fully capture this complexity. We may need to expand the billing-related fields in the Company and SubCompany objects.

### Feedback
Update Idea.md to consistently talk about billing by RFP counts however billing could be broken up a sub company level so update the data model to account for this complexity.  We want to mention that the reporting logic for invoice should roll up to parent company record (for example a top level company should have reporting of all activity below) but billing payment methods or accounts, or cost centers may be different a sub company level.  We should also provide cost center variables to departments to ease accounting reporting.

2. **RFP Processing and AI Integration**

- The "MainAppLayout.md" document describes a process for uploading and processing RFPs using the Google Gemini API.

- This process isn't reflected in the current data model. We might need additional objects or fields to track API usage, processing status, and cached conversations.

### Feedback
Lets add this to the data model.  We also need to add a close out feature that is representative as lock icon on the RFP in the navigation menu, this in effect closes the RFP and it cannot be modified but history is maintained.

3. **User Roles and Permissions**

- There's some inconsistency in how user roles are defined across documents.

- "Idea.md" doesn't mention specific roles.

- "MainAppLayout.md" and "OrgSetup.md" define Admin, Power User, and User roles, but with slightly different descriptions.

- The voting rights mentioned in "OrgSetup.md" aren't clearly represented in the current data model.
### Feedback

Lets update the wording for all documents so they are consistent and add additional information to the data model where necessary.

4. **RFP Folders**

- "Idea.md" mentions the ability to set up folders for RFPs, but this isn't reflected in the current data model or other documents.

### Feedback
Would this be required in the data model?  The tech stack used in Next.js with pocketbase as the DB.  Couldn't companies, sub companyies, departments just be folders within app module?

5. **Reporting and Analytics**

- "Idea.md" mentions reports on usage, but the current data model doesn't have a clear structure for storing or generating these reports.

### Feedback
Lets table this for now.  Most reports will be views based datamodel.

6. **Search Functionality**

- While a search bar is mentioned in the UI description, the data model doesn't specify how search indexing or functionality would be implemented.

### Feedback
Add the first pass for this.

7. **Document Rendering**

- The "MainAppLayout.md" mentions rendering of documents (PDFs to start), but it's not clear how this would be handled in the data model or application architecture.

### Feedback
I'm using Next.JS version 13+ so utilize the best practices for this tech stack

8. **Responsibility Checklist**

- "Idea.md" mentions generating a responsibility checklist after a go-vote, but this isn't reflected in the current data model.

### Feedback
Please add to data model

9. **Health of Response**

- "Idea.md" mentions comparing the health of response against the RFP, but it's not clear how this would be calculated or represented in the data model.

### Feedback
There should be a button to upload a response, and then an API call with a prompt that compares the RFP and amendments to the response document to ensure that all points are answered and highlight any areas where there should be clarification or something was not addressed.

10. **Automatic No-bid Responses**

- "Idea.md" mentions automatic responses for no-bids, but this functionality isn't clearly defined in the other documents or the data model.

### Feedback
This needs to be a part of the company or department configuration and we need to track this in the data profile.  This could be an AI generated no-bid response that contains company information and information from the RFP.