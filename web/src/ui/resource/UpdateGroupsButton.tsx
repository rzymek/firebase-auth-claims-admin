import SubmitIcon from '@mui/icons-material/Check';
import SecurityIcon from '@mui/icons-material/Security';
import Checkbox, { CheckboxProps } from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Popover from "@mui/material/Popover";
import TextField from '@mui/material/TextField';
import { useRefresh } from 'ra-core';
import { FormEventHandler, useState } from "react";
import { Button, useGetList, useListContext, useLoading, useUpdateMany } from "react-admin";

function GroupsEdit() {
    const { selectedIds = [], data: users = [] } = useListContext();
    const loading = useLoading();
    const refresh = useRefresh();
    const [updateMany] = useUpdateMany();
    const { data: groupData } = useGetList('Groups')

    const groups = groupData?.map(it => it.id) ?? [];
    const checkboxByGroup = computeGroupsState(users, groups, selectedIds);

    function assignGroup(group: string, enabled: boolean) {
        updateMany('Users', { ids: selectedIds, data: { [group]: enabled } }, {
            onSuccess() {
                refresh();
            }
        })
    }

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const group = (new FormData(form).get('name') as string).trim();
        form.reset();
        if (group === '') {
            return;
        }
        assignGroup(group, true);
    }
    const toggleGroup = (group: string) => {
        const current = checkboxByGroup[group];
        assignGroup(group, !current.checked);
    }

    return <>
        <FormControl component="fieldset" >
            <FormGroup>
                {groups.map(group =>
                    <FormControlLabel
                        control={<Checkbox {...checkboxByGroup[group]} onChange={() => toggleGroup(group)} />}
                        label={group}
                        key={group}
                        disabled={loading}
                    />
                )}
            </FormGroup>
        </FormControl>
        <form onSubmit={handleSubmit}>
            <TextField label="New" variant="standard" name="name" disabled={loading}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton type="submit" disabled={loading}><SubmitIcon /></IconButton>
                        </InputAdornment>
                    ),
                }} />
        </form>

    </>
}

function computeState(selection: string[][], group: string): CheckboxProps {
    const checked = selection.every(groups => groups.includes(group))
    return {
        indeterminate: !checked && selection.some(groups => groups.includes(group)),
        checked,
    }
}

function computeGroupsState(users: any[], groups: string[], selectedIds: string[]): { [group: string]: ReturnType<typeof computeState> } {
    const groupSelection = users
        .filter(it => selectedIds.includes(it.id))
        .map(it => it.groups.map((g: any) => g.id));
    return groups
        .reduce((res, group) => ({
            ...res,
            [group]: computeState(groupSelection, group)
        }), {})
}

export function GroupsPopover(props: {
    anchorEl: Element | undefined;
    onClose(): void;
}) {
    const { anchorEl, onClose } = props;
    return <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
        }}
    >
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {anchorEl && <GroupsEdit />}
        </div>
    </Popover>
}
export function UpdateGroupsButton(props: any) {
    const [anchorEl, setAnchorEl] = useState<Element>();

    return <>
        <Button label="Groups" onClick={e => setAnchorEl(e.currentTarget)}>
            <SecurityIcon />
        </Button>
        <GroupsPopover anchorEl={anchorEl} onClose={() => setAnchorEl(undefined)} />
    </>
}