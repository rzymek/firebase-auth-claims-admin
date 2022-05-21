import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { CircularProgress, Typography, useMediaQuery } from "@mui/material";
import { initializeApp } from "firebase/app";
import React, { useEffect, useState } from "react";
import {
  Admin, AdminProps, AppBar, ArrayField, BooleanField, BulkDeleteWithConfirmButton, BulkUpdateButton, ChipField,
  Datagrid, defaultTheme, EmailField, ExportButton, Layout, LayoutProps, List, MutationMode, RaThemeOptions, Resource, SearchInput, SimpleList, SingleFieldList, TextField, ToggleThemeButton, TopToolbar
} from 'react-admin';
import "./App.css";
import { AuthConfig } from "./AuthConfig";
import { createAuthProvider } from "./authProvider";
import { createDataProvider } from "./dataProvider";
import { createLoginPage } from "./LoginPage";
import { UpdateGroupsButton } from './UpdateGroupsButton';

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
      <BulkUpdateButton label="Disable" data={{ action: 'disable' }} mutationMode={mutationMode} icon={<LockIcon />}  />
      <BulkUpdateButton label="Enable" data={{ action: 'enable' }} mutationMode={mutationMode} icon={<LockOpenIcon />} />
      <UpdateGroupsButton />
    </>
  );
};
const GroupsField = () => (
  <ArrayField source="groups">
    <SingleFieldList>
      <ChipField source="name" />
    </SingleFieldList>
  </ArrayField>
)
const filters = [
  <SearchInput source="q" alwaysOn />,
]

export const UserList = () => {
  const isSmall = useMediaQuery((theme: RaThemeOptions) => theme.breakpoints?.down?.('sm')!!);
  return (
    <List filters={filters} actions={<TopToolbar><ExportButton /></TopToolbar>}>
      {isSmall
        ? <SimpleList
          primaryText={record => <>{record.displayName} <BooleanField source="enabled" /></>}
          secondaryText={record => <EmailField source="email" />}
          tertiaryText={record => <GroupsField />}
        />
        : <Datagrid rowClick="toggleSelection" bulkActionButtons={<ListActions />}>
          <TextField source="displayName" />
          <EmailField source="email" />
          <BooleanField source="enabled" />
          <GroupsField />
        </Datagrid>}
    </List>
  );
};

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

const darkTheme: RaThemeOptions = {
  palette: { mode: 'dark' },
};
export const MyAppBar = (props: any) => (
  <AppBar {...props}>
    <Typography flex="1" variant="h6" id="react-admin-title"></Typography>

    <ToggleThemeButton
      lightTheme={defaultTheme}
      darkTheme={darkTheme}
    />
  </AppBar>
);

const Nothing = () => <></>;
const NoMenuLayout = (props: LayoutProps) =>
  <Layout {...props} menu={Nothing} sidebar={Nothing} appBar={MyAppBar} />

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
      <Resource name="Users" list={UserList} />
    </Admin>
}

export default App;

