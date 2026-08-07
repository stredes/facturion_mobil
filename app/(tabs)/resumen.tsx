import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { ClientDebtsSection } from "@/components/ClientDebtsSection";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { FilterChip } from "@/components/FilterChip";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SecondaryButton } from "@/components/SecondaryButton";
import { MonthlySummaryCard } from "@/components/summary/MonthlySummaryCard";
import { MonthlySummarySkeleton } from "@/components/summary/MonthlySummarySkeleton";
import { useMonthlySummary } from "@/hooks/useMonthlySummary";
import {
  useGeneralPaymentService,
  useInvoiceService,
  useRetentionService,
  useTaxPaymentService,
} from "@/infrastructure/di/ServiceContext";
import {
  radius,
  spacing,
  typography,
  useThemeColors,
  type Colors,
} from "@/theme";
import { formatMonthPeriod } from "@/utils/dates";
import { toErrorMessage } from "@/utils/errors";
import {
  DEFAULT_MONTHLY_REPORT_SECTIONS,
  MONTHLY_REPORT_SECTION_OPTIONS,
  buildMonthlyReport,
  buildMonthlyReportFileName,
  buildMonthlyReportHtml,
  hasSelectedMonthlyReportSection,
  type MonthlyReportData,
  type MonthlyReportPeriodData,
  type MonthlyReportSectionKey,
  type MonthlyReportSections,
} from "@/utils/monthlyReport";
import type { CombinedMonth } from "@/utils/monthlySummary";

type ReportStep = 0 | 1 | 2;

interface GeneratedMonthlyReport {
  fileName: string;
  fileUri: string;
  pageCount: number;
  preview: string;
}

const REPORT_STEPS = ["Meses", "Datos", "PDF"] as const;

export default function SummaryScreen() {
  const { combined, isLoading, error, refresh } = useMonthlySummary();
  const invoiceService = useInvoiceService();
  const generalPaymentService = useGeneralPaymentService();
  const taxPaymentService = useTaxPaymentService();
  const retentionService = useRetentionService();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [expandedPeriods, setExpandedPeriods] = useState<Set<string>>(
    new Set(),
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reportStep, setReportStep] = useState<ReportStep>(0);
  const [selectedReportPeriods, setSelectedReportPeriods] = useState<
    Set<string>
  >(new Set());
  const [reportSections, setReportSections] = useState<MonthlyReportSections>(
    () => ({ ...DEFAULT_MONTHLY_REPORT_SECTIONS }),
  );
  const [generatedReport, setGeneratedReport] =
    useState<GeneratedMonthlyReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;

  useEffect(() => {
    if (combined.length === 0) {
      setSelectedReportPeriods(new Set());
      setGeneratedReport(null);
      return;
    }

    const validPeriods = new Set(combined.map((month) => month.period));
    let changed = false;

    setSelectedReportPeriods((prev) => {
      const next = new Set(
        Array.from(prev).filter((period) => validPeriods.has(period)),
      );

      if (next.size === 0) {
        next.add(combined[0].period);
      }

      changed = !areSetsEqual(prev, next);
      return changed ? next : prev;
    });

    if (changed) {
      setGeneratedReport(null);
    }
  }, [combined]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refresh();
      setGeneratedReport(null);
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh]);

  const toggleExpand = useCallback((period: string) => {
    setExpandedPeriods((prev) => {
      const next = new Set(prev);
      if (next.has(period)) {
        next.delete(period);
      } else {
        next.add(period);
      }
      return next;
    });
  }, []);

  const toggleReportPeriod = useCallback((period: string) => {
    setSelectedReportPeriods((prev) => {
      const next = new Set(prev);
      if (next.has(period)) {
        next.delete(period);
      } else {
        next.add(period);
      }
      return next;
    });
    setGeneratedReport(null);
  }, []);

  const selectAllReportPeriods = useCallback(() => {
    setSelectedReportPeriods(new Set(combined.map((month) => month.period)));
    setGeneratedReport(null);
  }, [combined]);

  const clearReportPeriods = useCallback(() => {
    setSelectedReportPeriods(new Set());
    setGeneratedReport(null);
  }, []);

  const toggleReportSection = useCallback((key: MonthlyReportSectionKey) => {
    setReportSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setGeneratedReport(null);
  }, []);

  const goToNextReportStep = useCallback(() => {
    if (reportStep === 0) {
      if (selectedReportPeriods.size === 0) {
        Alert.alert("Selecciona meses", "Elige al menos un mes para continuar.");
        return;
      }
      setReportStep(1);
      return;
    }

    if (reportStep === 1) {
      if (!hasSelectedMonthlyReportSection(reportSections)) {
        Alert.alert(
          "Selecciona datos",
          "Activa al menos una seccion para el informe.",
        );
        return;
      }
      setReportStep(2);
    }
  }, [reportSections, reportStep, selectedReportPeriods]);

  const goToPreviousReportStep = useCallback(() => {
    setReportStep((current) =>
      current > 0 ? ((current - 1) as ReportStep) : current,
    );
  }, []);

  const shareGeneratedReport = useCallback(
    async (report: GeneratedMonthlyReport) => {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(
          "Compartir no disponible",
          "El dispositivo no tiene disponible el compartir nativo.",
        );
        return;
      }

      await Sharing.shareAsync(report.fileUri, {
        dialogTitle: `Compartir ${report.fileName}`,
        mimeType: "application/pdf",
        UTI: "com.adobe.pdf",
      });
    },
    [],
  );

  const generateReport = useCallback(async () => {
    if (selectedReportPeriods.size === 0) {
      Alert.alert("Selecciona meses", "Elige al menos un mes para generar el PDF.");
      setReportStep(0);
      return;
    }

    if (!hasSelectedMonthlyReportSection(reportSections)) {
      Alert.alert(
        "Selecciona datos",
        "Activa al menos una seccion para el informe.",
      );
      setReportStep(1);
      return;
    }

    setIsGeneratingReport(true);

    try {
      const periods = await Promise.all(
        Array.from(selectedReportPeriods)
          .sort((a, b) => b.localeCompare(a))
          .map(async (period) => {
            const [year, month] = period.split("-");
            const [invoices, taxPayments, generalPayments, retentions] =
              await Promise.all([
                reportSections.invoices
                  ? invoiceService.getAll({ year, month })
                  : [],
                reportSections.taxPayments
                  ? taxPaymentService.getAll({ taxPeriod: period })
                  : [],
                reportSections.generalPayments
                  ? generalPaymentService.getAll({ year, month })
                  : [],
                reportSections.retentions
                  ? retentionService.getAll({ year, month })
                  : [],
              ]);

            return {
              period,
              invoices,
              taxPayments,
              generalPayments,
              retentions,
            } satisfies MonthlyReportPeriodData;
          }),
      );
      const reportData: MonthlyReportData = {
        generatedAt: new Date().toISOString(),
        periods,
        sections: reportSections,
      };
      const html = buildMonthlyReportHtml(reportData);
      const fileName = buildMonthlyReportFileName(reportData);
      const printResult = await Print.printToFileAsync({
        height: 842,
        html,
        textZoom: 100,
        width: 595,
      });
      const fileUri = await copyPdfToNamedCache(printResult.uri, fileName);
      const nextReport: GeneratedMonthlyReport = {
        fileName,
        fileUri,
        pageCount: printResult.numberOfPages,
        preview: buildMonthlyReport(reportData),
      };

      setGeneratedReport(nextReport);
      await shareGeneratedReport(nextReport);
    } catch (currentError) {
      Alert.alert(
        "No se pudo generar",
        toErrorMessage(currentError, "No se pudo generar el PDF"),
      );
    } finally {
      setIsGeneratingReport(false);
    }
  }, [
    generalPaymentService,
    invoiceService,
    reportSections,
    retentionService,
    selectedReportPeriods,
    shareGeneratedReport,
    taxPaymentService,
  ]);

  const shareReport = useCallback(async () => {
    if (!generatedReport) {
      return;
    }

    try {
      await shareGeneratedReport(generatedReport);
    } catch (currentError) {
      Alert.alert(
        "No se pudo compartir",
        toErrorMessage(currentError, "No se pudo compartir el PDF"),
      );
    }
  }, [generatedReport, shareGeneratedReport]);

  const renderItem = useCallback(
    ({ item }: { item: CombinedMonth }) => (
      <MonthlySummaryCard
        summary={item}
        isExpanded={expandedPeriods.has(item.period)}
        isSmallScreen={isSmallScreen}
        onToggle={() => toggleExpand(item.period)}
      />
    ),
    [expandedPeriods, isSmallScreen, toggleExpand],
  );

  const keyExtractor = useCallback((item: CombinedMonth) => item.period, []);

  const ItemSeparatorComponent = useCallback(
    () => <View style={styles.separator} />,
    [styles],
  );

  if (error) {
    return (
      <ScreenContainer>
        <AppHeader title="Resumen" subtitle="Facturacion y pagos por mes" />
        <ErrorState message={error} onRetry={refresh} />
      </ScreenContainer>
    );
  }

  if (isLoading) {
    return (
      <ScreenContainer scrollable>
        <AppHeader title="Resumen" subtitle="Facturacion y pagos por mes" />
        <MonthlySummarySkeleton />
      </ScreenContainer>
    );
  }

  if (combined.length === 0) {
    return (
      <ScreenContainer>
        <AppHeader title="Resumen" subtitle="Facturacion y pagos por mes" />
        <EmptyState
          title="Sin resumen"
          message="Registra una factura, pago o retencion para construir el resumen."
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <AppHeader title="Resumen" subtitle="Facturacion y pagos por mes" />
      <FlatList
        data={combined}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={ItemSeparatorComponent}
        ListHeaderComponent={
          <View style={styles.reportStack}>
            <MonthlyReportStepper
              generatedReport={generatedReport}
              isGenerating={isGeneratingReport}
              onBack={goToPreviousReportStep}
              onClearPeriods={clearReportPeriods}
              onGenerate={generateReport}
              onNext={goToNextReportStep}
              onSelectAllPeriods={selectAllReportPeriods}
              onShare={shareReport}
              onTogglePeriod={toggleReportPeriod}
              onToggleSection={toggleReportSection}
              periods={combined}
              sections={reportSections}
              selectedPeriods={selectedReportPeriods}
              step={reportStep}
            />
            <ClientDebtsSection />
          </View>
        }
        ListHeaderComponentStyle={styles.listHeader}
        refreshControl={
          <RefreshControl
            colors={[colors.primary.main]}
            onRefresh={onRefresh}
            refreshing={isRefreshing}
            tintColor={colors.primary.main}
          />
        }
      />
    </ScreenContainer>
  );
}

interface MonthlyReportStepperProps {
  periods: CombinedMonth[];
  selectedPeriods: Set<string>;
  sections: MonthlyReportSections;
  step: ReportStep;
  generatedReport: GeneratedMonthlyReport | null;
  isGenerating: boolean;
  onTogglePeriod: (period: string) => void;
  onSelectAllPeriods: () => void;
  onClearPeriods: () => void;
  onToggleSection: (key: MonthlyReportSectionKey) => void;
  onNext: () => void;
  onBack: () => void;
  onGenerate: () => void;
  onShare: () => void;
}

function MonthlyReportStepper({
  periods,
  selectedPeriods,
  sections,
  step,
  generatedReport,
  isGenerating,
  onTogglePeriod,
  onSelectAllPeriods,
  onClearPeriods,
  onToggleSection,
  onNext,
  onBack,
  onGenerate,
  onShare,
}: MonthlyReportStepperProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const selectedSections = MONTHLY_REPORT_SECTION_OPTIONS.filter(
    ({ key }) => sections[key],
  );
  const selectedPeriodCount = selectedPeriods.size;
  const canGenerate =
    selectedPeriodCount > 0 && hasSelectedMonthlyReportSection(sections);
  const primaryLabel =
    step === 2
      ? isGenerating
        ? "Generando PDF..."
        : generatedReport
          ? "Regenerar PDF"
          : "Generar PDF"
      : "Siguiente";
  const primaryDisabled =
    step === 0
      ? selectedPeriodCount === 0
      : step === 1
        ? !hasSelectedMonthlyReportSection(sections)
        : isGenerating || !canGenerate;
  const primaryAction = step === 2 ? onGenerate : onNext;
  const selectedPeriodLabel = formatSelectedPeriodLabel(selectedPeriods);

  return (
    <View style={styles.reportPanel}>
      <View style={styles.reportHeader}>
        <View>
          <Text style={styles.reportTitle}>Informe mensual</Text>
          <Text style={styles.reportSubtitle}>
            Paso {step + 1} de {REPORT_STEPS.length}
          </Text>
        </View>
      </View>

      <View style={styles.stepperRow}>
        {REPORT_STEPS.map((label, index) => {
          const isActive = index === step;
          const isDone = index < step;

          return (
            <View key={label} style={styles.stepperItem}>
              <View
                style={[
                  styles.stepCircle,
                  (isActive || isDone) && styles.stepCircleActive,
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    (isActive || isDone) && styles.stepNumberActive,
                  ]}
                >
                  {index + 1}
                </Text>
              </View>
              <Text
                numberOfLines={1}
                style={[styles.stepLabel, isActive && styles.stepLabelActive]}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.stepBody}>
        {step === 0 ? (
          <>
            <View style={styles.stepHeaderRow}>
              <Text style={styles.stepTitle}>Meses</Text>
              <Text style={styles.selectionCount}>
                {selectedPeriodCount} seleccionados
              </Text>
            </View>
            <View style={styles.inlineActions}>
              <SecondaryButton
                fullWidth={false}
                label="Todos"
                onPress={onSelectAllPeriods}
              />
              <SecondaryButton
                fullWidth={false}
                label="Limpiar"
                onPress={onClearPeriods}
              />
            </View>
            <View style={styles.chipGrid}>
              {periods.map((month) => (
                <FilterChip
                  key={month.period}
                  label={formatMonthPeriod(month.period)}
                  selected={selectedPeriods.has(month.period)}
                  onPress={() => onTogglePeriod(month.period)}
                />
              ))}
            </View>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <Text style={styles.stepTitle}>Datos</Text>
            <View style={styles.chipGrid}>
              {MONTHLY_REPORT_SECTION_OPTIONS.map((option) => (
                <FilterChip
                  key={option.key}
                  label={option.label}
                  selected={sections[option.key]}
                  onPress={() => onToggleSection(option.key)}
                />
              ))}
            </View>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <Text style={styles.stepTitle}>PDF</Text>
            <View style={styles.reportMetaBox}>
              <Text style={styles.reportMetaText}>{selectedPeriodLabel}</Text>
              <Text style={styles.reportMetaText}>
                {selectedSections.length > 0
                  ? selectedSections.map((option) => option.label).join(" / ")
                  : "Sin datos seleccionados"}
              </Text>
              {generatedReport ? (
                <Text style={styles.reportMetaText}>
                  {generatedReport.fileName} | {generatedReport.pageCount} pag.
                </Text>
              ) : null}
            </View>
            {generatedReport ? (
              <View style={styles.reportPreview}>
                <Text style={styles.previewTitle}>Vista previa</Text>
                <Text numberOfLines={14} style={styles.previewText}>
                  {generatedReport.preview}
                </Text>
              </View>
            ) : null}
          </>
        ) : null}
      </View>

      <View style={styles.actionStack}>
        <PrimaryButton
          disabled={primaryDisabled}
          label={primaryLabel}
          onPress={primaryAction}
        />
        {step > 0 ? (
          <SecondaryButton
            disabled={isGenerating}
            label="Volver"
            onPress={onBack}
          />
        ) : null}
        {step === 2 && generatedReport ? (
          <SecondaryButton
            disabled={isGenerating}
            label="Compartir PDF"
            onPress={onShare}
          />
        ) : null}
      </View>
    </View>
  );
}

async function copyPdfToNamedCache(
  sourceUri: string,
  fileName: string,
): Promise<string> {
  if (!FileSystem.cacheDirectory) {
    return sourceUri;
  }

  const targetUri = `${FileSystem.cacheDirectory}${fileName}`;
  await FileSystem.deleteAsync(targetUri, { idempotent: true });
  await FileSystem.copyAsync({ from: sourceUri, to: targetUri });
  return targetUri;
}

function formatSelectedPeriodLabel(selectedPeriods: Set<string>): string {
  const periods = Array.from(selectedPeriods).sort((a, b) =>
    a.localeCompare(b),
  );

  if (periods.length === 0) {
    return "Sin meses seleccionados";
  }

  if (periods.length === 1) {
    return formatMonthPeriod(periods[0]);
  }

  return `${periods.length} meses | ${periods[0]} a ${
    periods[periods.length - 1]
  }`;
}

function areSetsEqual(left: Set<string>, right: Set<string>): boolean {
  if (left.size !== right.size) {
    return false;
  }

  return Array.from(left).every((item) => right.has(item));
}

const createStyles = (c: Colors) =>
  StyleSheet.create({
    listContent: {
      paddingBottom: 120,
    },
    listHeader: {
      marginBottom: spacing.lg,
    },
    reportStack: {
      gap: spacing.xl,
    },
    separator: {
      height: spacing.lg,
    },
    reportPanel: {
      backgroundColor: c.surface.primary,
      borderColor: c.border.light,
      borderRadius: radius.card,
      borderWidth: 1,
      gap: spacing.lg,
      padding: spacing.cardPadding,
    },
    reportHeader: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    reportTitle: {
      ...typography.sectionTitle,
      color: c.text.primary,
    },
    reportSubtitle: {
      ...typography.caption,
      color: c.text.secondary,
      marginTop: spacing.xxs,
    },
    stepperRow: {
      alignItems: "flex-start",
      flexDirection: "row",
      gap: spacing.xs,
    },
    stepperItem: {
      alignItems: "center",
      flex: 1,
      gap: spacing.xs,
      minWidth: 0,
    },
    stepCircle: {
      alignItems: "center",
      backgroundColor: c.surface.secondary,
      borderColor: c.border.medium,
      borderRadius: 16,
      borderWidth: 1,
      height: 32,
      justifyContent: "center",
      width: 32,
    },
    stepCircleActive: {
      backgroundColor: c.primary.main,
      borderColor: c.primary.main,
    },
    stepNumber: {
      ...typography.label,
      color: c.text.secondary,
    },
    stepNumberActive: {
      color: c.text.inverse,
    },
    stepLabel: {
      ...typography.small,
      color: c.text.secondary,
      textAlign: "center",
    },
    stepLabelActive: {
      color: c.primary.main,
      fontWeight: "700",
    },
    stepBody: {
      gap: spacing.md,
    },
    stepHeaderRow: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    stepTitle: {
      ...typography.cardTitle,
      color: c.text.primary,
    },
    selectionCount: {
      ...typography.caption,
      color: c.text.secondary,
      flexShrink: 0,
    },
    inlineActions: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    chipGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    reportMetaBox: {
      backgroundColor: c.surface.secondary,
      borderColor: c.border.light,
      borderRadius: radius.inner,
      borderWidth: 1,
      gap: spacing.xs,
      padding: spacing.md,
    },
    reportMetaText: {
      ...typography.bodyMedium,
      color: c.text.primary,
    },
    reportPreview: {
      backgroundColor: c.background.tertiary,
      borderColor: c.border.light,
      borderRadius: radius.inner,
      borderWidth: 1,
      gap: spacing.xs,
      padding: spacing.md,
    },
    previewTitle: {
      ...typography.label,
      color: c.text.primary,
    },
    previewText: {
      ...typography.caption,
      color: c.text.secondary,
    },
    actionStack: {
      gap: spacing.sm,
    },
  });
