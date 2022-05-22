import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import GroupFilterIcon from '@mui/icons-material/Security';
import { Card, CardContent, CircularProgress, Typography, useMediaQuery } from "@mui/material";
import { initializeApp } from "firebase/app";
import { useEditContext } from 'ra-core';
import { useRecordContext } from 'ra-core';
import React, { useEffect, useState } from "react";
import {
  Admin, AdminProps, AppBar, ArrayField, BooleanField, BooleanInput, BulkDeleteWithConfirmButton, BulkUpdateButton, ChipField,
  Datagrid, defaultTheme, Edit, EmailField, ExportButton, FilterList, FilterListItem, Layout, LayoutProps, List, MutationMode, RaThemeOptions, ReferenceArrayInput, Resource, SearchInput, SelectArrayInput, SelectInput, SimpleForm, SimpleList, SingleFieldList, TextField, TextInput, ToggleThemeButton, TopToolbar, useGetList
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
      <BulkUpdateButton label="Disable" data={{ action: 'disable' }} mutationMode={mutationMode} icon={<LockIcon />} />
      <BulkUpdateButton label="Enable" data={{ action: 'enable' }} mutationMode={mutationMode} icon={<LockOpenIcon />} />
      <UpdateGroupsButton />
    </>
  );
};
function GroupsField() {
  return (
    <ArrayField source="groups">
      <SingleFieldList>
        <ChipField source="id" />
      </SingleFieldList>
    </ArrayField>
  );
}
const filters = [
  <SearchInput source="q" alwaysOn style={{ width: '50vw' }} />,
]

function FilterSidebar() {
  const { data } = useGetList("Groups");
  return <Card
    sx={{
      display: {
        xs: 'none',
        md: 'block',
      },
      order: -1,
      flex: '0 0 15em',
      mr: 2,
      mt: 8,
      alignSelf: 'flex-start',
    }}
  >
    <CardContent>
      <FilterList label="Groups" icon={<GroupFilterIcon />}>
        {data?.map(group =>
          <FilterListItem
            key={group.id}
            label={group.id}
            value={{ group: group.id }}
          />
        )}
      </FilterList>
    </CardContent>
  </Card>
}

export const UserList = () => {
  const isSmall = useMediaQuery((theme: RaThemeOptions) => theme.breakpoints?.down?.('sm')!!);
  return (
    <List filters={filters} actions={<TopToolbar><ExportButton /></TopToolbar>} aside={<FilterSidebar />}>
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
      <Resource name="Users" list={UserList} edit={UserEdit} />
    </Admin>
}

export default App;

const PostTitle = () => {
  const record = useRecordContext();
  console.log({ record });

  return <span>User</span>;
};

function UserEdit(props: any) {
  const { data: groupData } = useGetList('Groups')
  console.log(props);

  return <Edit title={<PostTitle />}>
    <SimpleForm>
      <TextInput disabled source="displayName" />
      <TextInput disabled source="email" />
      <TextInput disabled source="groups" />
      <BooleanInput label="Enabled" source="enabled" />
      <SelectArrayInput
        source='groups'
        choices={groupData?.map(g => ({ id: g.id, name: g.id }))}
      >
        <ChipField source="id" />
      </SelectArrayInput>
    </SimpleForm>
  </Edit>
}