import React, { useEffect, useState, useContext } from "react";
import type { KeyboardEvent, ChangeEvent } from "react";
import {
    Box,
    Grid,
    Paper,
    Button,
    Avatar,
    Divider,
    Stack
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { jwtDecode } from "jwt-decode";

import LocalStorageHandler from "@/utils/localStorageHandler";
import APIConstants from "@/utils/constants/APIConstants";
import AxiosApi from "@/utils/httpRequestHandler";
import { AppContext } from "@/app/context/appContext";
import logoFile from "@/assets/images/org-logo.png";
import * as ApiResponse from '@/types/api-response';

/** ===== Types ===== */





/** ===== Styles ===== */

const styles = {
    container: {
        top: "50%",
        left: "40%",
        position: "fixed" as const,
        marginTop: "-11em",
        marginLeft: "-15em"
    },
    subContainer: {
        width: 700,
        height: 300,
        padding: 20,
        display: "flex"
    },
    subContainer2: {
        width: "100%"
    },
    title: {
        fontSize: 26
    },
    field: {
        width: "100%"
    },
    actionArea: {
        display: "flex",
        justifyContent: "right"
    },
    register: {
        fontSize: 11
    },
    avatar: {
        height: "65px",
        width: "65px",
        border: "2px solid #337ab7"
    }
};

/** ===== Component ===== */

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const { handleBackDrop } = useContext(AppContext);

    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [orgLogoUrl, setOrgLogoUrl] = useState<string | null>(null);

    /** ===== Effects ===== */

    useEffect(() => {
        const token = LocalStorageHandler.getToken();
        if (token) navigate("/");
        getOrgLogo();
    }, []);

    /** ===== Handlers ===== */

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter") login();
    };

    const login = async (): Promise<void> => {
        try {
            handleBackDrop(true);

            const response = await AxiosApi.postData<{ data: ApiResponse.LoginResponse }>(
                APIConstants.APP_LOGIN,
                { userName: username, password }
            );

            handleBackDrop(false);

            // Save token immediately (important)
            LocalStorageHandler.setToken(response.data?.token);

            // Decode (optional usage)
            const decoded = jwtDecode(response.data?.token);
            console.log("JWT:", decoded);

           

        } catch (error: any) {
            handleBackDrop(false);
            enqueueSnackbar(error?.message || "Login failed", {
                variant: "error"
            });
        }
    };

    const getOrgLogo = (): void => {
        const logoUrl = localStorage.getItem("orgLogoUrl");
        if (logoUrl) setOrgLogoUrl(logoUrl);
    };

    /** ===== UI ===== */

    return (
        <Box style={styles.container} onKeyDown={onKeyDown}>
            <Paper elevation={2} style={styles.subContainer}>
                <Grid container spacing={0} style={styles.subContainer2}>

                    {/* LEFT */}
                    <Grid size={5}>
                        <Stack direction="row" spacing={0.5}>
                            <img
                                style={{ height: 240, marginRight: 2 }}
                                src={logoFile}
                                alt="logo"
                            />
                            <Divider orientation="vertical" flexItem />
                        </Stack>
                    </Grid>

                    {/* RIGHT */}
                    <Grid size={7}>
                        <Grid container spacing={2}>

                            <Grid size={12}>
                                {orgLogoUrl ? (
                                    <>
                                        <Avatar src={orgLogoUrl} style={styles.avatar} />
                                        <Box style={styles.title}>
                                            Intellifleet IT
                                        </Box>
                                    </>
                                ) : (
                                    <Box style={styles.title}>Welcome back!</Box>
                                )}
                            </Grid>

                            <Grid size={12}>
                                <TextField
                                    label="User ID"
                                    size="small"
                                    fullWidth
                                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                        setUsername(e.target.value)
                                    }
                                />
                            </Grid>

                            <Grid size={12}>
                                <TextField
                                    label="Password"
                                    type="password"
                                    size="small"
                                    fullWidth
                                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                        setPassword(e.target.value)
                                    }
                                />
                            </Grid>

                            <Grid size={9}>
                                <Box style={styles.register}>
                                    Do not have account?{" "}
                                    <a href="/register">Click here</a>
                                </Box>
                            </Grid>

                            <Grid size={3}>
                                <Box style={styles.actionArea}>
                                    <Button variant="outlined" onClick={login}>
                                        Login
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default Login;