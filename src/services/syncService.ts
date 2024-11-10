import { type QueryClient } from '@tanstack/react-query'
import { api } from '~/trpc/react'

export class SyncService {
  constructor(private queryClient: QueryClient) {}

  async syncAll() {
    await Promise.all([
      this.syncGenetics(),
      this.syncPlants(),
      this.syncBatches(),
    ])
  }

  private async syncGenetics() {
    await this.queryClient.invalidateQueries({
      queryKey: ['genetic.list'],
    })
  }

  private async syncPlants() {
    await this.queryClient.invalidateQueries({
      queryKey: ['plant.list'],
    })
  }

  private async syncBatches() {
    await this.queryClient.invalidateQueries({
      queryKey: ['batch.list'],
    })
  }
}
