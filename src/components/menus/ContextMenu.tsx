import React from "react";
import { Divider, ListItemIcon, ListItemText, Menu, MenuItem, MenuList, Paper } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../state/Hooks";
import {
    selectContextMenuState,
    setAddServerDialogOpen,
    setObservablesDialogOpen,
    setServerManagementDialogOpen,
    setSettingsDialogOpen,
    setSystemsDialogOpen,
    updateContextMenuState
} from "../../state/Slice";
import { Hub, Lan, SettingsApplications, Storage, Visibility } from "@mui/icons-material";

const ContextMenu = () => {
    const dispatch = useAppDispatch();
    const menuState = useAppSelector(selectContextMenuState);

    const openSettings = () => {
        dispatch(updateContextMenuState({ showMenu: false }));
        dispatch(setSettingsDialogOpen(true));
    };

    const openServerManagement = () => {
        dispatch(updateContextMenuState({ showMenu: false }));
        dispatch(setServerManagementDialogOpen(true));
    };

    const openObservables = () => {
        dispatch(updateContextMenuState({ showMenu: false }));
        dispatch(setObservablesDialogOpen(true));
    };

    const openSystems = () => {
        dispatch(updateContextMenuState({ showMenu: false }));
        dispatch(setSystemsDialogOpen(true));
    };

    const openAddServer = () => {
        dispatch(updateContextMenuState({ showMenu: false }));
        dispatch(setAddServerDialogOpen(true));
    };

    console.log('menu state', menuState);


    return (
        <Menu
            style={{ zIndex: '1000' }}
            open={menuState.showMenu}
            onClose={() => dispatch(updateContextMenuState({ showMenu: false }))}
            anchorReference="anchorPosition"
            anchorPosition={
                menuState.showMenu
                    ? { top: menuState.top, left: menuState.left }
                    : undefined
            }
            variant="menu"
        >
            <Paper sx={{ width: 230 }} elevation={0}>
                <MenuList>
                    <MenuItem onClick={openObservables}>
                        <ListItemIcon>
                            <Visibility color="primary" fontSize="medium" />
                        </ListItemIcon>
                        <ListItemText primary="Observables" />
                    </MenuItem>
                    <Divider orientation="horizontal" />
                    <MenuItem onClick={openSystems}>
                        <ListItemIcon>
                            <Hub color="primary" fontSize="medium" />
                        </ListItemIcon>
                        <ListItemText primary="Systems" />
                    </MenuItem>
                    <Divider orientation="horizontal" />
                    <MenuItem onClick={openAddServer}>
                        <ListItemIcon>
                            <Lan color="primary" fontSize="medium" />
                        </ListItemIcon>
                        <ListItemText primary="Add Server" />
                    </MenuItem>
                    <MenuItem onClick={openServerManagement}>
                        <ListItemIcon>
                            <Storage color="primary" fontSize="medium" />
                        </ListItemIcon>
                        <ListItemText primary="Server Management" />
                    </MenuItem>
                    <Divider orientation="horizontal" />
                    <MenuItem onClick={openSettings}>
                        <ListItemIcon>
                            <SettingsApplications color="primary" fontSize="medium" />
                        </ListItemIcon>
                        <ListItemText primary="Settings" />
                    </MenuItem>
                </MenuList>
            </Paper>
        </Menu>
    );
};

export default ContextMenu;
