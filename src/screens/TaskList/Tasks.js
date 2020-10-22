import React, { useState, useCallback } from "react";
import { StyleSheet, View, ToastAndroid, FlatList, Button } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Provider, FAB, ActivityIndicator } from "react-native-paper";

import { getAllTasks } from "../../utils/firebase";

import CustomHeader from "./Components/Header";
import TaskCard from "./Components/TaskCard";
import SlideUpPanel from "./Components/SlideUpPanel";
import Colors from "../../theming/colors";

export default function Home({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [tasksList, setTasksList] = useState([]);
    const [sortType, setSortType] = useState({
        sortMode: "createdAt",
        sortOrder: "desc",
    });
    const { sortMode, sortOrder } = sortType;
    const [filter, setFilter] = useState(false);

    useFocusEffect(
        useCallback(() => {
            getTasks(sortMode, sortOrder);
        }, [sortMode, sortOrder, filter])
    );

    const getTasks = async () => {
        const list = await getAllTasks(sortMode, sortOrder);
        setTasksList(
            !filter ? list : list.filter((item) => item.isCompleted === true)
        );
        setLoading(false);
    };

    const handleSyncButton = async () => {
        await getTasks(sortMode, sortOrder);
        ToastAndroid.show("Synced with cloud storage", ToastAndroid.SHORT);
    };

    const handleSortByPriority = () => {
        setLoading(true);
        setSortType({
            sortMode: "priorityIs",
            sortOrder: sortOrder === "asc" ? "desc" : "asc",
        });
    };

    const handleSortByDueAt = () => {
        setLoading(true);
        setSortType({
            sortMode: "taskTime",
            sortOrder: sortOrder === "asc" ? "desc" : "asc",
        });
    };

    const handleSortByCreatedAt = () => {
        setLoading(true);
        setSortType({
            sortMode: "createdAt",
            sortOrder: sortOrder === "asc" ? "desc" : "asc",
        });
    };

    const handleFilter = () => {
        setLoading(true);
        setFilter(!filter);
    };

    const renderTaskCard = ({ item }) => (
        <TaskCard navigation={navigation} taskItem={item} />
    );

    return (
        <Provider>
            <CustomHeader
                navigation={navigation}
                handleSlider={() => _panel.show()}
                handleSync={handleSyncButton}
            />
            {loading ? (
                <View style={{ flex: 1, justifyContent: "center" }}>
                    <ActivityIndicator color={Colors.accentColor} />
                </View>
            ) : (
                <View style={styles.flatListContainer}>
                    <FlatList
                        removeClippedSubviews={true}
                        data={tasksList}
                        extraData={sortMode}
                        keyExtractor={(item) => item.id}
                        renderItem={renderTaskCard}
                    />
                </View>
            )}
            <FAB
                style={styles.fab}
                icon="plus"
                color={Colors.iconColor}
                onPress={() => navigation.navigate("Add Task")}
            />
            <SlideUpPanel
                handleSortByCreatedAt={handleSortByCreatedAt}
                handleSortByDueAt={handleSortByDueAt}
                handleSortByPriority={handleSortByPriority}
                handleFilter={handleFilter}
                sortMode={sortMode}
                sortOrder={sortOrder}
                filter={filter}
                handleRef={(c) => (_panel = c)}
            />
        </Provider>
    );
}

const styles = StyleSheet.create({
    flatListContainer: {
        flex: 1,
        paddingVertical: 5,
        backgroundColor: Colors.background,
    },
    fab: {
        position: "absolute",
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: Colors.accentColor,
    },
});
