import {
  Document,
  Page,
  StyleSheet,
  Text,
  View
} from "@react-pdf/renderer";

import type { ReportData } from "@/types/view-models";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 11,
    color: "#1a1a1a"
  },
  title: {
    fontSize: 22,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 10,
    marginBottom: 18,
    color: "#666666"
  },
  section: {
    marginBottom: 16
  },
  heading: {
    fontSize: 13,
    marginBottom: 8
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e6e1d5"
  }
});

export function PDFReportTemplate({
  report,
  label
}: {
  report: ReportData;
  label: string;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Brighter Horizons Academy</Text>
        <Text style={styles.subtitle}>Restorative Tarbiyah Report · {label}</Text>

        <View style={styles.section}>
          <Text style={styles.heading}>Executive summary</Text>
          <Text>Total sessions: {report.totalSessions}</Text>
          <Text>Active Murāqabah cases: {report.flaggedStudents.length}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Sessions by R</Text>
          {report.byR.map((entry) => (
            <View key={entry.name} style={styles.row}>
              <Text>{entry.name}</Text>
              <Text>{entry.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Grade breakdown</Text>
          {report.byGrade.map((entry) => (
            <View key={entry.name} style={styles.row}>
              <Text>Grade {entry.name}</Text>
              <Text>{entry.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Top infractions</Text>
          {report.topInfractions.map((entry) => (
            <View key={entry.name} style={styles.row}>
              <Text>{entry.name}</Text>
              <Text>{entry.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Murāqabah cases</Text>
          {report.flaggedStudents.length === 0 ? (
            <Text>No active Murāqabah cases in this range.</Text>
          ) : (
            report.flaggedStudents.map((entry) => (
              <View key={entry.sessionId} style={styles.row}>
                <Text>
                  {entry.name} · Grade {entry.grade}
                </Text>
                <Text>{entry.reason.replaceAll("_", " ")}</Text>
              </View>
            ))
          )}
        </View>
      </Page>
    </Document>
  );
}

