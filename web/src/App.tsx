import { CircularProgress } from "@mui/material";
import { initializeApp } from "firebase/app";
import { useEffect, useState } from "react";
import {
  Admin, AdminProps, ArrayField, BooleanField, BulkDeleteWithConfirmButton, BulkUpdateButton, ChipField,
  Datagrid, EmailField, Layout, LayoutProps, List, MutationMode, Resource, SingleFieldList, TextField
} from 'react-admin';
import "./App.css";
import { AuthConfig } from "./AuthConfig";
import { createAuthProvider } from "./authProvider";
import { createDataProvider } from "./dataProvider";
import { createLoginPage } from "./LoginPage";

export const GroupList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="displayName" />
    </Datagrid>
  </List>
);

const ListActions = () => {
  const mutationMode: MutationMode = "pessimistic";
  return (
    <>
      <BulkDeleteWithConfirmButton mutationMode={mutationMode} />
      <BulkUpdateButton label="Disable" data={{ action: 'disable' }} mutationMode={mutationMode} />
      <BulkUpdateButton label="Enable" data={{ action: 'enable' }} mutationMode={mutationMode} />
      <BulkUpdateButton label="Admin" data={{ action: 'give-admin' }} mutationMode={mutationMode} />
      <BulkUpdateButton label="User" data={{ action: 'take-admin' }} mutationMode={mutationMode} />
    </>
  );
};

export const UserList = () => (
  <List>
    <Datagrid rowClick="toggleSelection" bulkActionButtons={<ListActions />}>
      <TextField source="displayName" />
      <EmailField source="email" />
      <BooleanField source="enabled" />
      <ArrayField source="groups">
        <SingleFieldList>
          <ChipField source="name" />
        </SingleFieldList>
      </ArrayField>
    </Datagrid>
  </List>
);

function Loading() {
  const size = 100;
  return <CircularProgress style={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: size,
    height: size,
    margin: -size / 2,
  }} />
}

const Nothing = () => <></>;
const NoMenuLayout = (props:LayoutProps) => <Layout {...props} menu={Nothing} sidebar={Nothing} />

function App() {
  const [adminProps, setAdminProps] = useState<AdminProps>();
  useEffect(() => {
    fetch('/authConfig').then(resp => resp.json()).then((authConfig: AuthConfig) => {
      const firebaseApp = initializeApp({
        apiKey: authConfig.apiKey,
        authDomain: `${authConfig.projectId}.firebaseapp.com`,
        projectId: authConfig.projectId,
      });
      setAdminProps({
        dataProvider: createDataProvider(firebaseApp),
        authProvider: createAuthProvider(firebaseApp),
        loginPage: createLoginPage(firebaseApp, authConfig),
      })
    }).catch(() => setAdminProps({}));
  }, []);
  return !adminProps ? <Loading /> :
    <Admin requireAuth {...adminProps} layout={NoMenuLayout}>
      <Resource name="users" list={UserList} />
    </Admin>
}

export default App;