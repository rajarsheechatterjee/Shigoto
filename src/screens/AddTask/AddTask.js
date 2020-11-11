import React, { useState, useContext } from "react";
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    ToastAndroid,
    Animated,
} from "react-native";
import {
    TouchableRipple,
    Portal,
    Dialog,
    Provider,
    Button,
    TextInput as PaperInput,
    Chip,
    Switch,
} from "react-native-paper";
import { CheckBox } from "react-native-elements";

import moment from "moment";
import BottomSheet from "rn-sliding-up-panel";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import Appbar from "./Components/AddTaskHeader";
import { addTask } from "../../utils/firebase";
import Colors from "../../theming/colors";
import * as MailComposer from "expo-mail-composer";

import { ThemeContext } from "../../navigation/ThemeProvider";

export default function AddTask({ navigation }) {
    const { theme } = useContext(ThemeContext);

    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskContent, setNewTaskContent] = useState("");
    const [priority, setPriority] = useState(2);

    const [isVisible, setIsVisible] = useState(false);
    const [chosenDate, setChosenDate] = useState("");

    const [dialogVisible, setDialogVisible] = useState(false);
    const showDialog = () => setDialogVisible(true);
    const hideDialog = () => {
        setDialogVisible(false);
        setError(false);
    };

    const [email, setEmail] = useState();
    const [emails, setEmails] = useState([]);
    const [sendEmail, setSendEmail] = useState(false);
    const [error, setError] = useState(false);
    const onToggleSwitch = () => setSendEmail(!sendEmail);
    const addEmail = () => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (re.test(String(email).toLowerCase())) {
            if (emails.length > 0) {
                const index = emails.indexOf(email);
                if (index > -1) {
                    setError("Email already added");
                } else {
                    setEmails((emails) => emails.concat(email));
                    setEmail("");
                    setDialogVisible(false);
                    setError("");
                }
            } else {
                setEmails((emails) => emails.concat(email));
                setEmail("");
                setDialogVisible(false);
                setError("");
            }
        } else {
            setError("Enter a valid email");
        }
    };

    const handleAddTask = async () => {
        if (newTaskTitle === "") {
            ToastAndroid.show("Task title is empty", ToastAndroid.SHORT);
        } else {
            if (sendEmail && emails.length > 0) {
                await MailComposer.composeAsync({
                    recipients: emails,
                    subject: newTaskTitle,
                    body: newTaskContent,
                });
            }

            await addTask(
                navigation,
                newTaskTitle,
                chosenDate,
                newTaskContent,
                priority,
                emails
            );

            ToastAndroid.show("Task Added", ToastAndroid.SHORT);
            clearFields();
        }
    };

    const clearFields = () => {
        setNewTaskTitle("");
        setNewTaskContent("");
        setChosenDate("");
    };

    // Date & time picker
    const handlePicker = (date) => {
        setChosenDate(date);
        setIsVisible(false);
    };
    const showPicker = () => setIsVisible(true);
    const hidePicker = () => setIsVisible(false);

    return (
        <Provider>
            <Appbar
                navigation={navigation}
                handleRef={() => _panel.show()}
                showPicker={showPicker}
                handleAddTask={handleAddTask}
                newTaskTitle={newTaskTitle}
                clearFields={clearFields}
                theme={theme}
                showModal={showDialog}
            />
            <View
                style={[
                    styles.mainContainer,
                    { backgroundColor: theme.background },
                ]}
            >
                <Portal>
                    <Dialog
                        visible={dialogVisible}
                        onDismiss={hideDialog}
                        style={{ backgroundColor: theme.background }}
                    >
                        <Dialog.Title style={{ color: theme.textColor }}>
                            Add Collaborators
                        </Dialog.Title>
                        <Dialog.Content>
                            <PaperInput
                                label="Email"
                                mode="outlined"
                                dense={true}
                                error={error}
                                onChangeText={(text) => setEmail(text)}
                                selectionColor={theme.secondaryAccentColor}
                                theme={{
                                    colors: {
                                        primary: theme.secondaryAccentColor,
                                        text: theme.textColor,
                                        underlineColor: "transparent",
                                    },
                                }}
                                style={{
                                    backgroundColor: theme.background,
                                }}
                            />
                            {error !== "" && (
                                <Text
                                    style={{
                                        color: "red",
                                        paddingTop: 5,
                                    }}
                                >
                                    {error}
                                </Text>
                            )}
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button
                                onPress={() => setEmails([])}
                                color={theme.secondaryAccentColor}
                            >
                                Clear emails
                            </Button>
                            <Button
                                onPress={addEmail}
                                color={theme.secondaryAccentColor}
                            >
                                Add
                            </Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
                <View style={{ flex: 1 }}>
                    <TextInput
                        multiline={true}
                        style={[styles.titleInput, { color: theme.textColor }]}
                        placeholder="Title"
                        onChangeText={(text) => setNewTaskTitle(text)}
                        defaultValue={newTaskTitle}
                        placeholderTextColor={theme.subTextColor}
                    />
                    <Text
                        onPress={showPicker}
                        style={[
                            styles.dateInput,
                            { color: theme.subTextColor },
                        ]}
                    >
                        {chosenDate !== ""
                            ? moment(chosenDate).calendar()
                            : "Reminder Time"}
                    </Text>
                    <TextInput
                        style={[
                            styles.contentInput,
                            { color: theme.textColor },
                        ]}
                        onChangeText={(text) => setNewTaskContent(text)}
                        placeholder="Content"
                        defaultValue={newTaskContent}
                        multiline={true}
                        placeholderTextColor={theme.subTextColor}
                    />
                    <View
                        style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            marginHorizontal: 10,
                            marginVertical: 50,
                            fontSize: 15,
                            paddingTop: 10,
                            borderTopWidth: 1.2,
                            borderTopColor: "#E8E8E8",
                            lineHeight: 23,
                        }}
                    >
                        {emails.length > 0 ? (
                            emails.map((item) => (
                                <Chip
                                    icon="email"
                                    style={{
                                        marginVertical: 5,
                                        marginRight: 5,
                                    }}
                                >
                                    {item}
                                </Chip>
                            ))
                        ) : (
                            <Chip
                                onPress={showDialog}
                                icon="email-plus"
                                style={{
                                    marginVertical: 5,
                                    marginRight: 5,
                                }}
                            >
                                Add Collaborators
                            </Chip>
                        )}
                    </View>
                </View>
                <DateTimePickerModal
                    isVisible={isVisible}
                    onConfirm={handlePicker}
                    onCancel={hidePicker}
                    mode="datetime"
                    is24Hour={false}
                />
            </View>
            <BottomSheet
                animatedValue={new Animated.Value(280)}
                ref={(c) => (_panel = c)}
                draggableRange={{ top: 280, bottom: 50 }}
                snappingPoints={[50, 280]}
                showBackdrop={false}
            >
                <View
                    style={[
                        styles.bottomSheetContainer,
                        { backgroundColor: theme.bottomsheetColor },
                    ]}
                >
                    <View style={styles.indicator} />
                    <Text
                        style={[
                            styles.priorityHeading,
                            { color: theme.secondaryAccentColor },
                        ]}
                    >
                        Collaborators
                    </Text>
                    <TouchableRipple
                        style={[
                            styles.setPriority,
                            { paddingRight: 35, paddingVertical: 10 },
                        ]}
                        onPress={() => setSendEmail(!sendEmail)}
                    >
                        <>
                            <Text
                                style={{
                                    fontSize: 15,
                                    color: theme.textColor,
                                }}
                            >
                                Send Email to Collaborators
                            </Text>
                            <Switch
                                value={sendEmail}
                                onValueChange={onToggleSwitch}
                                color={theme.secondaryAccentColor}
                            />
                        </>
                    </TouchableRipple>

                    <Text
                        style={[
                            styles.priorityHeading,
                            { color: theme.secondaryAccentColor },
                        ]}
                    >
                        Priority
                    </Text>
                    <TouchableRipple
                        style={styles.setPriority}
                        onPress={() => setPriority(1)}
                    >
                        <>
                            <Text
                                style={{ fontSize: 15, color: theme.textColor }}
                            >
                                High
                            </Text>
                            <CheckBox
                                checkedColor={theme.priorityHigh}
                                uncheckedColor={theme.priorityHigh}
                                checkedIcon="dot-circle-o"
                                uncheckedIcon="circle-o"
                                checked={priority === 1 ? true : false}
                                containerStyle={styles.checkBox}
                                onPress={() => setPriority(1)}
                            />
                        </>
                    </TouchableRipple>
                    <TouchableRipple
                        style={styles.setPriority}
                        onPress={() => setPriority(2)}
                    >
                        <>
                            <Text
                                style={{ fontSize: 15, color: theme.textColor }}
                            >
                                Medium
                            </Text>
                            <CheckBox
                                checkedColor={theme.priorityMid}
                                uncheckedColor={theme.priorityMid}
                                checkedIcon="dot-circle-o"
                                uncheckedIcon="circle-o"
                                checked={priority === 2 ? true : false}
                                containerStyle={styles.checkBox}
                                onPress={() => setPriority(2)}
                            />
                        </>
                    </TouchableRipple>
                    <TouchableRipple
                        style={styles.setPriority}
                        onPress={() => setPriority(3)}
                    >
                        <>
                            <Text
                                style={{ fontSize: 15, color: theme.textColor }}
                            >
                                Low
                            </Text>
                            <CheckBox
                                checkedColor={theme.priorityLow}
                                uncheckedColor={theme.priorityLow}
                                checkedIcon="dot-circle-o"
                                uncheckedIcon="circle-o"
                                checked={priority === 3 ? true : false}
                                containerStyle={styles.checkBox}
                                onPress={() => setPriority(3)}
                            />
                        </>
                    </TouchableRipple>
                </View>
            </BottomSheet>
        </Provider>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        padding: 10,
    },
    dateInput: { marginHorizontal: 10, paddingTop: 5 },
    titleInput: {
        fontSize: 30,
        fontWeight: "bold",
        paddingVertical: 15,
        marginHorizontal: 10,
        borderBottomWidth: 1.2,
        borderBottomColor: "#E8E8E8",
    },
    contentInput: {
        paddingTop: 10,
        marginHorizontal: 10,
        fontSize: 18,
        lineHeight: 29,
    },
    checkBox: {
        borderRadius: 10,
        borderWidth: 0,
    },
    bottomSheetContainer: {
        flex: 1,
        paddingTop: 20,
        paddingBottom: 8,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        elevation: 10,
    },
    priorityHeading: {
        fontWeight: "bold",
        fontSize: 15,
        color: Colors.accentColor,
        paddingHorizontal: 20,
        // paddingBottom: 5,
    },
    setPriority: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    indicator: {
        position: "absolute",
        justifyContent: "center",
        alignSelf: "center",
        width: 40,
        height: 5,
        backgroundColor: "rgba(0,0,0,0.75)",
        borderRadius: 25,
        top: 7,
    },
});
