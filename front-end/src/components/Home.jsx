import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Paper,
  IconButton,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Fade,
} from "@mui/material";
import { Mic, MicOff, CloudUpload } from "@mui/icons-material";
import { styled } from "@mui/system";
import io from "socket.io-client";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm'
import { CircularProgress } from "@mui/material";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6, 5),
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(4),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
  borderRadius: 20,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: "0 24px 60px -24px rgba(30, 27, 46, 0.18)",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(4, 2.5),
  },
}));

const StyledSubmitButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(1),
  height: 52,
  fontSize: "1rem",
}));

const reportProseSx = {
  "& h1, & h2, & h3": {
    fontWeight: 800,
    letterSpacing: "-0.01em",
    color: "text.primary",
    mt: 3,
    mb: 1.5,
  },
  "& h1": { fontSize: "1.5rem" },
  "& h2": {
    fontSize: "1.2rem",
    pb: 1,
    borderBottom: "1px solid",
    borderColor: "divider",
  },
  "& h3": { fontSize: "1.05rem" },
  "& p": { color: "text.secondary", lineHeight: 1.75, mb: 2 },
  "& strong": { color: "text.primary", fontWeight: 700 },
  "& ul, & ol": { pl: 3, mb: 2, color: "text.secondary" },
  "& li": { mb: 0.75, lineHeight: 1.7 },
  "& hr": { border: "none", borderTop: "1px solid", borderColor: "divider", my: 3 },
  "& > *:first-of-type": { mt: 0 },
  maxWidth: "68ch",
  mx: "auto",
};

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [isEndOfInterview, setIsEndOfInterview] = useState(false);
  const [report, setReport] = useState("");
  const [selectedInterviewer, setSelectedInterviewer] = useState("Matthew");

  const mediaRecorderRef = useRef(null);
  const socketRef = useRef(null);
  const audioChunks = useRef([]);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleEndInterview = () => {
    socketRef.current.emit("end-interview");
  }

  useEffect(() => {
    socketRef.current = io(process.env.REACT_APP_SERVER_URL || "http://localhost:5001");
    socketRef.current.on("connection", () =>
      console.log("Connected to server")
    );
    socketRef.current.on("upload-status", (data) => {
      setStatusMessage(data.message);
      setSnackbarOpen(true);
    });
    socketRef.current.on("upload-error", (error) => {
      setStatusMessage(error);
      setSnackbarOpen(true);
    });
    socketRef.current.on("audio-response", (audioArrayBuffer) => {
      if (audioArrayBuffer) {
        const audioBlob = new Blob([audioArrayBuffer], { type: 'audio/mp3' });
        const url = URL.createObjectURL(audioBlob);
        console.log("This is URL", url);
        setAudioUrl(url);
        setLoading(false);
      }
    });

    socketRef.current.on("end-response", (report) => {
      setIsEndOfInterview(true);
      setReport(report);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleStartRecording = () => {
    setIsRecording(true);
    navigator.mediaDevices
      .getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      })
      .then((stream) => {
        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType: "audio/webm",
        });
        mediaRecorderRef.current.ondataavailable = (event) =>
          audioChunks.current.push(event.data);
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunks.current, {
            type: "audio/wav",
          });
          audioChunks.current = [];
          audioBlob.arrayBuffer().then((audioData) => {
            if (socketRef.current) {
              socketRef.current.emit("audio", audioData);
            }
          });
        };
        mediaRecorderRef.current.start();
        if (socketRef.current) {
          socketRef.current.emit("start");
        }
      })
      .catch((error) => console.error("Error accessing microphone:", error));
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setLoading(true);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      if (socketRef.current) {
        socketRef.current.emit("stop");
      }
    }
  };

  const handleSubmit = () => {
    if (resume && jobDescription) {
      if (socketRef.current) {
        setIsSetup(true);
        socketRef.current.emit("submit", { resume, jobDescription, selectedInterviewer });
      }
    } else {
      setStatusMessage("Please enter both resume and job description.");
      setSnackbarOpen(true);
    }
  };

  const handleInterviewerChange = (event) => {
    setSelectedInterviewer(event.target.value);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: { xs: 6, md: 10 },
        px: 2,
      }}
    >
      <Container component="main" maxWidth="md">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            mb: { xs: 4, md: 5 },
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "11px",
              background: "linear-gradient(135deg, #6366F1, #4F46E5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 16px rgba(79, 70, 229, 0.32)",
              flexShrink: 0,
            }}
          >
            <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "1.15rem" }}>
              P
            </Typography>
          </Box>
          <Typography component="h1" variant="h4">
            Prepify
          </Typography>
        </Box>

        <StyledPaper elevation={0}>
          <Box width="100%">
            {loading ? (
              <Fade in>
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  sx={{ minHeight: 240 }}
                >
                  <CircularProgress size={36} thickness={4} />
                </Box>
              </Fade>
            ) : (
              !isSetup ? (
                <Fade in>
                  <Box>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          multiline
                          rows={7}
                          variant="outlined"
                          label="Resume"
                          value={resume}
                          onChange={(e) => setResume(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          multiline
                          rows={7}
                          variant="outlined"
                          label="Job Description"
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel id="interviewer-label">Interviewer</InputLabel>
                          <Select
                            labelId="interviewer-label"
                            label="Interviewer"
                            value={selectedInterviewer}
                            onChange={handleInterviewerChange}
                            displayEmpty
                            fullWidth
                            variant="outlined"
                          >
                            <MenuItem value="Matthew">Matthew</MenuItem>
                            <MenuItem value="Ruth">Ruth</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                    <StyledSubmitButton
                      onClick={handleSubmit}
                      fullWidth
                      variant="contained"
                      color="primary"
                      size="large"
                      startIcon={<CloudUpload />}
                    >
                      Submit Application
                    </StyledSubmitButton>
                  </Box>
                </Fade>
              ) : (
                !isEndOfInterview && (
                  <Fade in>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexDirection="column"
                      sx={{ minHeight: { xs: 260, md: 320 }, gap: 5 }}
                    >
                      <IconButton
                        onClick={isRecording ? handleStopRecording : handleStartRecording}
                        sx={{
                          width: 120,
                          height: 120,
                          borderRadius: "50%",
                          bgcolor: isRecording ? "#EF4444" : "primary.main",
                          color: "#fff",
                          boxShadow: isRecording
                            ? "0 10px 28px rgba(239, 68, 68, 0.35)"
                            : "0 10px 28px rgba(79, 70, 229, 0.35)",
                          transition: "background-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease",
                          "&:hover": {
                            bgcolor: isRecording ? "#DC2626" : "primary.dark",
                            transform: "scale(1.04)",
                          },
                        }}
                      >
                        {isRecording ? (
                          <MicOff sx={{ fontSize: 44 }} />
                        ) : (
                          <Mic sx={{ fontSize: 44 }} />
                        )}
                      </IconButton>
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="large"
                        onClick={handleEndInterview}
                        sx={{ px: 4 }}
                      >
                        End Interview
                      </Button>
                    </Box>
                  </Fade>
                )
              )
            )}
            {isEndOfInterview && (
              <Fade in>
                <Box>
                  <Box sx={reportProseSx}>
                    <ReactMarkdown children={report} remarkPlugins={[remarkGfm]} />
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={() => window.location.reload()}
                    >
                      Back to Home
                    </Button>
                  </Box>
                </Box>
              </Fade>
            )}
          </Box>
        </StyledPaper>
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          message={statusMessage}
        />
        {audioUrl !== null && (
          <audio key={audioUrl} autoPlay>
            <source src={audioUrl} type="audio/mp3" />
          </audio>
        )}
      </Container>
    </Box>
  );
}
