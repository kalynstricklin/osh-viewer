/*
 * Copyright (c) 2022.  Botts Innovative Research, Inc.
 * All Rights Reserved
 *
 * opensensorhub/osh-viewer is licensed under the
 *
 * Mozilla Public License 2.0
 * Permissions of this weak copyleft license are conditioned on making available source code of licensed
 * files and modifications of those files under the same license (or in certain cases, one of the GNU licenses).
 * Copyright and license notices must be preserved. Contributors provide an express grant of patent rights.
 * However, a larger work using the licensed work may be distributed under different terms and without
 * source code for files added in the larger work.
 *
 */

import React from "react";
import {
    Alert,
    Divider,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
} from "@mui/material";
import {useAppDispatch, useAppSelector} from "../../state/Hooks";
import {selectFeatureOfInterest, setFeatureOfInterestDialogOpen} from "../../state/Slice";
import DraggableDialog from "../decorators/DraggableDialog";
import {IFeatureOfInterest} from "../../data/Models";
import FeatureOfInterestEntry from "./FeatureOfInterestEntry";

interface IFeatureOfInterestProps {
    title: string,
    children?: any
}

const FeatureOfInterests = (props: IFeatureOfInterestProps) => {

    const dispatch = useAppDispatch();

    let fois: Map<string, IFeatureOfInterest> = useAppSelector<Map<string, IFeatureOfInterest>>(selectFeatureOfInterest);

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    let content: JSX.Element = (
        <Alert severity="warning" variant={"filled"}>
            No Feature of Interests Available, Verify or Configure Server(s)
        </Alert>
    );

    let foiEntries:  JSX.Element[] = [];

    fois.forEach((foi: IFeatureOfInterest) => {
        if (foi.parentSystemUuid == null) {
            foiEntries.push(<FeatureOfInterestEntry key={foi.uuid} server={foi.server} foi={foi}/>);
        }
    })

    if (foiEntries.length) {

        content = (
            <Paper style={{margin: '.5em', padding: '.5em'}}>
                <TableContainer>
                    <Table size="small" aria-label="Feature of Interest Entries">
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Server Name</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {foiEntries.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Divider/>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 15]}
                    component="div"
                    count={foiEntries.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        );
    }

    return (
        <DraggableDialog title={props.title} onClose={() => dispatch(setFeatureOfInterestDialogOpen(false))}>
            {content}
        </DraggableDialog>
    );
}

export default FeatureOfInterests;